'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ChainConfig,
  X_LAYER_MAINNET,
  getChainByIdHex,
  formatUnits,
  parseUnits,
  toHexQuantity,
  isAddress,
} from './xlayer'

// Minimal EIP-1193 provider shape (MetaMask / OKX Wallet inject this).
interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  isMetaMask?: boolean
  isOkxWallet?: boolean
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
    okxwallet?: Eip1193Provider
  }
}

export type WalletStatus = 'disconnected' | 'connecting' | 'connected'

export interface WalletState {
  status: WalletStatus
  address: string | null
  chainIdHex: string | null
  chain: ChainConfig | undefined
  balance: string | null // human-readable OKB on the active chain
  error: string | null
  hasProvider: boolean
  isOnXLayer: boolean
}

function getProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  // Prefer OKX Wallet (native to X Layer) when present, else any injected wallet.
  return window.okxwallet ?? window.ethereum
}

export function useWallet(targetChain: ChainConfig = X_LAYER_MAINNET) {
  const [status, setStatus] = useState<WalletStatus>('disconnected')
  const [address, setAddress] = useState<string | null>(null)
  const [chainIdHex, setChainIdHex] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasProvider, setHasProvider] = useState(false)

  const chain = getChainByIdHex(chainIdHex)
  const isOnXLayer = !!chain

  useEffect(() => {
    setHasProvider(!!getProvider())
  }, [])

  const refreshBalance = useCallback(
    async (addr?: string | null) => {
      const provider = getProvider()
      const account = addr ?? address
      if (!provider || !account) return
      try {
        const hexBalance: string = await provider.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        })
        setBalance(formatUnits(BigInt(hexBalance), 18, 6))
      } catch (e: any) {
        // Non-fatal: leave previous balance, surface a soft error.
        setError(e?.message ?? 'Failed to read balance')
      }
    },
    [address],
  )

  const syncChain = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return
    try {
      const id: string = await provider.request({ method: 'eth_chainId' })
      setChainIdHex(id)
    } catch {
      /* ignore */
    }
  }, [])

  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('未检测到钱包。请安装 OKX Wallet 或 MetaMask。')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' })
      const account = accounts?.[0] ?? null
      setAddress(account)
      await syncChain()
      await refreshBalance(account)
      setStatus(account ? 'connected' : 'disconnected')
    } catch (e: any) {
      setStatus('disconnected')
      setError(e?.message ?? '连接钱包失败')
    }
  }, [refreshBalance, syncChain])

  const disconnect = useCallback(() => {
    // Injected wallets have no programmatic disconnect; clear local state.
    setAddress(null)
    setBalance(null)
    setStatus('disconnected')
  }, [])

  const switchToXLayer = useCallback(
    async (target: ChainConfig = targetChain) => {
      const provider = getProvider()
      if (!provider) {
        setError('未检测到钱包。')
        return false
      }
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: target.chainIdHex }],
        })
        await syncChain()
        await refreshBalance()
        return true
      } catch (e: any) {
        // 4902 = chain not added yet → add it, then it becomes active.
        if (e?.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: target.chainIdHex,
                  chainName: target.chainName,
                  nativeCurrency: target.nativeCurrency,
                  rpcUrls: target.rpcUrls,
                  blockExplorerUrls: target.blockExplorerUrls,
                },
              ],
            })
            await syncChain()
            await refreshBalance()
            return true
          } catch (addErr: any) {
            setError(addErr?.message ?? '添加 X Layer 网络失败')
            return false
          }
        }
        setError(e?.message ?? '切换网络失败')
        return false
      }
    },
    [targetChain, refreshBalance, syncChain],
  )

  /** Send native OKB. Returns the transaction hash. */
  const sendOKB = useCallback(
    async (to: string, amount: string): Promise<string> => {
      const provider = getProvider()
      if (!provider) throw new Error('未检测到钱包。')
      if (!address) throw new Error('请先连接钱包。')
      if (!isAddress(to)) throw new Error(`收款地址无效：${to}`)
      const value = parseUnits(amount, 18)
      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to, value: toHexQuantity(value) }],
      })
      // Optimistically refresh balance shortly after broadcasting.
      setTimeout(() => refreshBalance(), 3000)
      return txHash
    },
    [address, refreshBalance],
  )

  // React to wallet account / network changes.
  useEffect(() => {
    const provider = getProvider()
    if (!provider?.on) return

    const handleAccounts = (accounts: string[]) => {
      const account = accounts?.[0] ?? null
      setAddress(account)
      setStatus(account ? 'connected' : 'disconnected')
      if (account) refreshBalance(account)
      else setBalance(null)
    }
    const handleChain = (id: string) => {
      setChainIdHex(id)
      refreshBalance()
    }

    provider.on('accountsChanged', handleAccounts)
    provider.on('chainChanged', handleChain)
    return () => {
      provider.removeListener?.('accountsChanged', handleAccounts)
      provider.removeListener?.('chainChanged', handleChain)
    }
  }, [refreshBalance])

  // Restore an already-authorized session on mount (no popup).
  useEffect(() => {
    const provider = getProvider()
    if (!provider) return
    ;(async () => {
      try {
        const accounts: string[] = await provider.request({ method: 'eth_accounts' })
        if (accounts?.[0]) {
          setAddress(accounts[0])
          setStatus('connected')
          await syncChain()
          await refreshBalance(accounts[0])
        }
      } catch {
        /* ignore */
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const state: WalletState = {
    status,
    address,
    chainIdHex,
    chain,
    balance,
    error,
    hasProvider,
    isOnXLayer,
  }

  return { ...state, connect, disconnect, switchToXLayer, sendOKB, refreshBalance }
}

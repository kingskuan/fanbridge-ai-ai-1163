'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem'
import { ACTIVE_CHAIN, ACTIVE_CHAIN_ID, CONTRACT_ADDRESS } from '@/lib/xlayer'
import { FanBridgeRegistryAbi } from '@/lib/contract'

declare global {
  interface Window {
    ethereum?: any
  }
}

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(),
})

type Status = 'idle' | 'connecting' | 'registering' | 'predicting'

export function XLayerPanel() {
  const [account, setAccount] = useState<Address | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [registered, setRegistered] = useState(false)
  const [totalFans, setTotalFans] = useState<bigint>(0n)
  const [totalPredictions, setTotalPredictions] = useState<bigint>(0n)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastTx, setLastTx] = useState<string | null>(null)

  const hasContract = Boolean(CONTRACT_ADDRESS)

  const refreshStats = useCallback(async () => {
    if (!hasContract) return
    try {
      const [fans, preds] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS as Address,
          abi: FanBridgeRegistryAbi,
          functionName: 'totalFans',
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS as Address,
          abi: FanBridgeRegistryAbi,
          functionName: 'totalPredictions',
        }),
      ])
      setTotalFans(fans as bigint)
      setTotalPredictions(preds as bigint)
    } catch (e: any) {
      // contract may not be deployed yet; silently ignore
    }
  }, [hasContract])

  const refreshRegistration = useCallback(
    async (addr: Address) => {
      if (!hasContract) return
      try {
        const isReg = await publicClient.readContract({
          address: CONTRACT_ADDRESS as Address,
          abi: FanBridgeRegistryAbi,
          functionName: 'registered',
          args: [addr],
        })
        setRegistered(Boolean(isReg))
      } catch {
        setRegistered(false)
      }
    },
    [hasContract],
  )

  useEffect(() => {
    refreshStats()
    const id = setInterval(refreshStats, 8000)
    return () => clearInterval(id)
  }, [refreshStats])

  useEffect(() => {
    if (!window.ethereum) return
    const handleAccountsChanged = (accs: string[]) => {
      const a = (accs[0] as Address | undefined) ?? null
      setAccount(a)
      if (a) refreshRegistration(a)
    }
    const handleChainChanged = (cid: string) => setChainId(parseInt(cid, 16))
    window.ethereum.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum.on?.('chainChanged', handleChainChanged)
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [refreshRegistration])

  const connect = async () => {
    setError(null)
    if (!window.ethereum) {
      setError('未检测到钱包，请安装 OKX Wallet 或 MetaMask')
      return
    }
    setStatus('connecting')
    try {
      const accs: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accs[0] as Address
      setAccount(addr)
      const cid = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(parseInt(cid, 16))
      await refreshRegistration(addr)
    } catch (e: any) {
      setError(e?.message ?? 'connect failed')
    } finally {
      setStatus('idle')
    }
  }

  const switchToXLayer = async () => {
    if (!window.ethereum) return
    const hexId = '0x' + ACTIVE_CHAIN_ID.toString(16)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexId }],
      })
    } catch (e: any) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexId,
              chainName: ACTIVE_CHAIN.name,
              nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
              rpcUrls: ACTIVE_CHAIN.rpcUrls.default.http,
              blockExplorerUrls: [ACTIVE_CHAIN.blockExplorers!.default.url],
            },
          ],
        })
      } else {
        setError(e?.message ?? 'switch chain failed')
      }
    }
  }

  const register = async () => {
    if (!account || !hasContract) return
    setError(null)
    setStatus('registering')
    try {
      const walletClient = createWalletClient({
        account,
        chain: ACTIVE_CHAIN,
        transport: custom(window.ethereum),
      })
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: FanBridgeRegistryAbi,
        functionName: 'register',
      })
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      await refreshRegistration(account)
      await refreshStats()
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? 'register failed')
    } finally {
      setStatus('idle')
    }
  }

  const predict = async () => {
    if (!account || !hasContract) return
    setError(null)
    setStatus('predicting')
    try {
      const walletClient = createWalletClient({
        account,
        chain: ACTIVE_CHAIN,
        transport: custom(window.ethereum),
      })
      const matchId = `match-${Date.now()}`
      const pick = ['HOME', 'DRAW', 'AWAY'][Math.floor(Math.random() * 3)]
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: FanBridgeRegistryAbi,
        functionName: 'predict',
        args: [matchId, pick],
      })
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      await refreshStats()
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? 'predict failed')
    } finally {
      setStatus('idle')
    }
  }

  const onCorrectChain = chainId === ACTIVE_CHAIN_ID
  const explorer = ACTIVE_CHAIN.blockExplorers?.default.url

  return (
    <section id="xlayer" className="relative z-10 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                X Layer 链上演示
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Chain ID {ACTIVE_CHAIN_ID} · {ACTIVE_CHAIN.name}
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="text-gray-400">合约地址</div>
              <div className="font-mono text-purple-300 break-all">
                {hasContract ? (
                  <a
                    href={`${explorer}/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-300"
                  >
                    {CONTRACT_ADDRESS}
                  </a>
                ) : (
                  <span className="text-yellow-400">尚未部署</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-gray-400 uppercase tracking-wider">链上粉丝总数</div>
              <div className="text-3xl font-bold text-white mt-1">{totalFans.toString()}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-gray-400 uppercase tracking-wider">累计预测次数</div>
              <div className="text-3xl font-bold text-white mt-1">{totalPredictions.toString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            {!account && (
              <button
                onClick={connect}
                disabled={status === 'connecting'}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white disabled:opacity-60"
              >
                {status === 'connecting' ? '连接中…' : '连接钱包'}
              </button>
            )}

            {account && !onCorrectChain && (
              <button
                onClick={switchToXLayer}
                className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-semibold text-white"
              >
                切换到 {ACTIVE_CHAIN.name}
              </button>
            )}

            {account && onCorrectChain && hasContract && (
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={register}
                  disabled={registered || status === 'registering'}
                  className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-white disabled:opacity-50"
                >
                  {registered ? '✓ 已注册为粉丝' : status === 'registering' ? '注册中…' : '注册成为粉丝'}
                </button>
                <button
                  onClick={predict}
                  disabled={!registered || status === 'predicting'}
                  className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-white disabled:opacity-50"
                >
                  {status === 'predicting' ? '上链中…' : '上链一次预测'}
                </button>
              </div>
            )}

            {account && onCorrectChain && !hasContract && (
              <div className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                合约还没部署。运行 <code className="font-mono">npm run hh:deploy:xlayer-testnet</code>，
                把输出的地址写入 <code className="font-mono">.env.local</code> 的{' '}
                <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code>，然后重启 dev server。
              </div>
            )}

            {account && (
              <div className="text-xs text-gray-400 font-mono break-all pt-2">
                已连接：{account}
                {chainId !== null && ` · chainId=${chainId}`}
              </div>
            )}

            {lastTx && explorer && (
              <a
                href={`${explorer}/tx/${lastTx}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-cyan-300 hover:text-cyan-200 underline break-all"
              >
                上一笔交易 → {lastTx}
              </a>
            )}

            {error && (
              <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

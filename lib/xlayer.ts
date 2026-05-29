// X Layer network definitions and lightweight on-chain helpers.
// No web3 SDK dependency — everything runs through the injected EIP-1193
// provider (window.ethereum) plus native BigInt math, which keeps the
// production build small and reliable.

export interface ChainConfig {
  key: 'mainnet' | 'testnet'
  chainId: number
  chainIdHex: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

// https://web3.okx.com/xlayer  /  https://www.okx.com/xlayer/docs
export const X_LAYER_MAINNET: ChainConfig = {
  key: 'mainnet',
  chainId: 196,
  chainIdHex: '0xc4',
  chainName: 'X Layer Mainnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://rpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer'],
}

export const X_LAYER_TESTNET: ChainConfig = {
  key: 'testnet',
  chainId: 195,
  chainIdHex: '0xc3',
  chainName: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer-test'],
}

export const X_LAYER_CHAINS: Record<ChainConfig['key'], ChainConfig> = {
  mainnet: X_LAYER_MAINNET,
  testnet: X_LAYER_TESTNET,
}

export function getChainByIdHex(chainIdHex?: string | null): ChainConfig | undefined {
  if (!chainIdHex) return undefined
  const normalized = chainIdHex.toLowerCase()
  return Object.values(X_LAYER_CHAINS).find((c) => c.chainIdHex === normalized)
}

export function explorerAddressUrl(chain: ChainConfig, address: string): string {
  return `${chain.blockExplorerUrls[0]}/address/${address}`
}

export function explorerTxUrl(chain: ChainConfig, txHash: string): string {
  return `${chain.blockExplorerUrls[0]}/tx/${txHash}`
}

// ---------- unit helpers (18-decimal OKB) ----------

const TEN = BigInt(10)

/** Convert a wei (smallest-unit) bigint to a human string with up to `maxFractionDigits` decimals. */
export function formatUnits(value: bigint, decimals = 18, maxFractionDigits = 4): string {
  const negative = value < BigInt(0)
  const abs = negative ? -value : value
  const base = TEN ** BigInt(decimals)
  const whole = abs / base
  const fraction = abs % base

  let fractionStr = fraction.toString().padStart(decimals, '0')
  // Trim to the requested precision, then drop trailing zeros.
  fractionStr = fractionStr.slice(0, maxFractionDigits).replace(/0+$/, '')

  const sign = negative ? '-' : ''
  return fractionStr.length > 0 ? `${sign}${whole}.${fractionStr}` : `${sign}${whole}`
}

/** Parse a human decimal string (e.g. "0.25") into a wei bigint. Throws on invalid input. */
export function parseUnits(value: string, decimals = 18): bigint {
  const trimmed = value.trim()
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid amount: "${value}"`)
  }
  const [whole, fraction = ''] = trimmed.split('.')
  if (fraction.length > decimals) {
    throw new Error(`Too many decimal places (max ${decimals})`)
  }
  const paddedFraction = fraction.padEnd(decimals, '0')
  const base = TEN ** BigInt(decimals)
  return BigInt(whole) * base + BigInt(paddedFraction || '0')
}

/** Convert a bigint to a 0x-prefixed hex quantity (for JSON-RPC params). */
export function toHexQuantity(value: bigint): string {
  return '0x' + value.toString(16)
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 2 + chars * 2) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

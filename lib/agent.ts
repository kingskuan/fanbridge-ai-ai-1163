// FanBridge AI — on-device intent parser.
//
// Turns a natural-language message (Chinese or English) into a structured
// intent the UI can execute against the wallet. It is intentionally
// dependency-free and deterministic so the agent works with zero API keys.
// To upgrade to an LLM, replace `parseIntent` with a server call that returns
// the same `AgentIntent` shape — the rest of the app stays unchanged.

import { isAddress } from './xlayer'

export type AgentIntentType =
  | 'help'
  | 'connect'
  | 'balance'
  | 'address'
  | 'switch'
  | 'send'
  | 'matches'
  | 'explorer'
  | 'unknown'

export interface AgentIntent {
  type: AgentIntentType
  // For 'send'
  to?: string
  amount?: string
  // For 'switch'
  network?: 'mainnet' | 'testnet'
  // A natural-language acknowledgement to show before any async action runs.
  reply: string
}

const ADDRESS_RE = /0x[a-fA-F0-9]{40}/
// Matches "0.25", "0.25 OKB", "0.25个", etc. — first standalone number.
const AMOUNT_RE = /(\d+(?:\.\d+)?)\s*(?:okb|个|枚)?/i

function has(text: string, ...keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k))
}

export function parseIntent(raw: string): AgentIntent {
  const text = raw.trim()
  const lower = text.toLowerCase()

  // --- send / transfer (check first: most specific) ---
  if (has(lower, 'send', 'transfer', 'pay', 'tip') || has(text, '转', '发送', '打赏', '付', '给')) {
    const addrMatch = text.match(ADDRESS_RE)
    const amountMatch = text.match(AMOUNT_RE)
    const to = addrMatch?.[0]
    const amount = amountMatch?.[1]
    if (to && amount && isAddress(to)) {
      return {
        type: 'send',
        to,
        amount,
        reply: `好的，正在准备一笔转账：${amount} OKB → ${to}。钱包会弹出确认窗口，请你最终签名。`,
      }
    }
    return {
      type: 'send',
      to,
      amount,
      reply:
        '转账需要「金额 + 收款地址」。例如：`转 0.1 OKB 给 0x1234...abcd`。请补全后再发给我。',
    }
  }

  // --- balance ---
  if (has(lower, 'balance', 'how much') || has(text, '余额', '多少', '有多少钱', '资产')) {
    return { type: 'balance', reply: '正在查询你在 X Layer 上的 OKB 余额…' }
  }

  // --- address ---
  if (has(lower, 'address', 'my wallet', 'my account') || has(text, '地址', '我的钱包', '账户')) {
    return { type: 'address', reply: '这是你当前连接的钱包地址：' }
  }

  // --- switch network ---
  if (
    has(lower, 'switch', 'network', 'mainnet', 'testnet', 'x layer', 'xlayer') ||
    has(text, '切换', '网络', '主网', '测试网', '切到')
  ) {
    const network: 'mainnet' | 'testnet' =
      has(lower, 'testnet') || has(text, '测试网') ? 'testnet' : 'mainnet'
    return {
      type: 'switch',
      network,
      reply: `正在切换到 X Layer ${network === 'testnet' ? '测试网' : '主网'}…`,
    }
  }

  // --- connect ---
  if (has(lower, 'connect', 'login', 'sign in') || has(text, '连接', '登录', '连钱包')) {
    return { type: 'connect', reply: '正在唤起钱包连接…' }
  }

  // --- explorer ---
  if (has(lower, 'explorer', 'oklink', 'scan') || has(text, '浏览器', '区块', '查看交易')) {
    return { type: 'explorer', reply: '正在为你打开 X Layer 区块浏览器…' }
  }

  // --- matches / fan info ---
  if (has(lower, 'match', 'game', 'odds', 'fixture', 'football', 'soccer') || has(text, '比赛', '赛事', '赔率', '球赛', '今天')) {
    return { type: 'matches', reply: '为你整理了今日热门赛事（示例数据）：' }
  }

  // --- help / fallback ---
  if (has(lower, 'help', 'what can you', 'how') || has(text, '帮助', '你能', '怎么', '能做什么')) {
    return { type: 'help', reply: HELP_TEXT }
  }

  return { type: 'unknown', reply: UNKNOWN_TEXT }
}

export const HELP_TEXT = `我是你的 X Layer 链上经纪人，可以帮你：
• 🔗 连接钱包（OKX Wallet / MetaMask）
• 🌐 一键切换到 X Layer 主网 / 测试网
• 💰 查询 OKB 余额
• 📤 转账 OKB，例如「转 0.1 OKB 给 0x...」
• ⚽ 查看今日热门赛事（示例）
• 🔍 打开区块浏览器

直接用中文或英文告诉我你想做什么，也可以点麦克风用语音说。`

const UNKNOWN_TEXT = `我还不太确定你的意思。你可以试试：
• 「我的余额是多少？」
• 「切换到 X Layer 主网」
• 「转 0.05 OKB 给 0x...」
• 「今天有什么比赛？」
或者输入「帮助」查看全部功能。`

// Illustrative fan/sports data. In production this would come from a sports
// data API; kept local so the demo is self-contained and clearly labeled.
export interface DemoMatch {
  home: string
  away: string
  time: string
  homeOdds: number
  drawOdds: number
  awayOdds: number
}

export const DEMO_MATCHES: DemoMatch[] = [
  { home: '巴西', away: '阿根廷', time: '今晚 21:00', homeOdds: 2.1, drawOdds: 3.2, awayOdds: 3.0 },
  { home: '曼城', away: '皇马', time: '明晨 03:00', homeOdds: 1.9, drawOdds: 3.5, awayOdds: 3.8 },
  { home: '拜仁', away: '巴黎', time: '明晨 03:00', homeOdds: 2.4, drawOdds: 3.3, awayOdds: 2.7 },
]

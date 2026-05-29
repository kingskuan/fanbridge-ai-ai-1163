'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Inter } from 'next/font/google'
import {
  CpuChipIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline'
import { useWallet } from '@/lib/useWallet'
import { useVoice } from '@/lib/useVoice'
import { parseIntent, HELP_TEXT, DEMO_MATCHES, DemoMatch } from '@/lib/agent'
import {
  X_LAYER_CHAINS,
  ChainConfig,
  shortenAddress,
  explorerAddressUrl,
  explorerTxUrl,
} from '@/lib/xlayer'

const inter = Inter({ subsets: ['latin'] })

interface ChatLink {
  label: string
  href: string
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
  link?: ChatLink
  matches?: DemoMatch[]
}

let messageId = 0
const nextId = () => ++messageId

export default function HomePage() {
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet')
  const targetChain: ChainConfig = X_LAYER_CHAINS[network]
  const wallet = useWallet(targetChain)
  const voice = useVoice('zh-CN')

  const [input, setInput] = useState('')
  const [speakReplies, setSpeakReplies] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'assistant',
      text:
        '👋 我是 FanBridge AI，你的 X Layer 链上经纪人。连接钱包后，用自然语言或语音就能查余额、切网络、转账 OKB。输入「帮助」看看我能做什么。',
    },
  ])
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const push = (msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }])
  }

  const assistantSay = (text: string, extra?: Partial<Message>) => {
    push({ role: 'assistant', text, ...extra })
    if (speakReplies) voice.speak(text)
  }

  const requireConnected = (): boolean => {
    if (!wallet.address) {
      assistantSay('你还没有连接钱包。点右上角「连接钱包」，或对我说「连接钱包」。')
      return false
    }
    return true
  }

  async function execute(intentText: string) {
    const intent = parseIntent(intentText)

    switch (intent.type) {
      case 'help':
        assistantSay(HELP_TEXT)
        return

      case 'connect':
        assistantSay(intent.reply)
        await wallet.connect()
        if (wallet.address) {
          assistantSay(`已连接：${shortenAddress(wallet.address)}`)
        }
        return

      case 'address':
        if (!requireConnected()) return
        assistantSay(intent.reply + ' ' + wallet.address, {
          link: {
            label: '在区块浏览器中查看',
            href: explorerAddressUrl(targetChain, wallet.address!),
          },
        })
        return

      case 'balance': {
        if (!requireConnected()) return
        assistantSay(intent.reply)
        await wallet.refreshBalance()
        const sym = (wallet.chain ?? targetChain).nativeCurrency.symbol
        if (!wallet.isOnXLayer) {
          assistantSay(
            `你的钱包当前不在 X Layer 网络。先对我说「切换到 X Layer 主网」再查询，或我现在显示的余额可能来自其它网络。`,
          )
        }
        assistantSay(`你的余额：${wallet.balance ?? '—'} ${sym}（${(wallet.chain ?? targetChain).chainName}）`)
        return
      }

      case 'switch': {
        const target = X_LAYER_CHAINS[intent.network ?? network]
        setNetwork(target.key)
        assistantSay(intent.reply)
        const ok = await wallet.switchToXLayer(target)
        assistantSay(
          ok
            ? `✅ 已切换到 ${target.chainName}。`
            : `切换失败，请在钱包里手动确认网络切换。`,
        )
        return
      }

      case 'send': {
        if (!intent.to || !intent.amount) {
          assistantSay(intent.reply)
          return
        }
        if (!requireConnected()) return
        if (!wallet.isOnXLayer) {
          assistantSay('先切换到 X Layer 再转账。对我说「切换到 X Layer 主网」即可。')
          return
        }
        assistantSay(intent.reply)
        try {
          const hash = await wallet.sendOKB(intent.to, intent.amount)
          assistantSay(`✅ 交易已广播！`, {
            link: { label: `查看交易 ${shortenAddress(hash, 6)}`, href: explorerTxUrl(targetChain, hash) },
          })
        } catch (e: any) {
          assistantSay(`❌ 转账失败：${e?.message ?? '未知错误'}`)
        }
        return
      }

      case 'explorer': {
        const href = wallet.address
          ? explorerAddressUrl(targetChain, wallet.address)
          : targetChain.blockExplorerUrls[0]
        assistantSay(intent.reply, { link: { label: '打开 OKLink 浏览器', href } })
        return
      }

      case 'matches':
        assistantSay(intent.reply, { matches: DEMO_MATCHES })
        return

      default:
        assistantSay(intent.reply)
    }
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setInput('')
    push({ role: 'user', text: content })
    setBusy(true)
    try {
      await execute(content)
    } finally {
      setBusy(false)
    }
  }

  const handleMic = () => {
    if (!voice.supported) return
    if (voice.listening) {
      voice.stop()
      return
    }
    voice.listen((transcript) => {
      setInput(transcript)
      handleSend(transcript)
    })
  }

  const quickActions = useMemo(
    () => [
      { label: '连接钱包', cmd: '连接钱包' },
      { label: '切换到 X Layer', cmd: '切换到 X Layer 主网' },
      { label: '查询余额', cmd: '我的余额是多少' },
      { label: '今日赛事', cmd: '今天有什么比赛' },
      { label: '帮助', cmd: '帮助' },
    ],
    [],
  )

  const networkBadge = wallet.isOnXLayer
    ? wallet.chain!.chainName
    : wallet.address
    ? '未知网络'
    : '未连接'

  return (
    <div
      className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white`}
    >
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                FanBridge AI
              </h1>
              <p className="text-xs text-gray-400">X Layer 链上经纪人</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as 'mainnet' | 'testnet')}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="mainnet">X Layer 主网</option>
              <option value="testnet">X Layer 测试网</option>
            </select>

            {wallet.address ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    wallet.isOnXLayer ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                />
                <div className="text-right leading-tight">
                  <div className="text-sm font-medium">{shortenAddress(wallet.address)}</div>
                  <div className="text-[10px] text-gray-400">{networkBadge}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => wallet.connect()}
                disabled={wallet.status === 'connecting'}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-60"
              >
                <WalletIcon className="w-4 h-4" />
                {wallet.status === 'connecting' ? '连接中…' : '连接钱包'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Wallet panel */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-purple-400" /> 钱包
            </h2>

            {!wallet.hasProvider && (
              <p className="text-sm text-yellow-300/90 mb-3">
                未检测到 Web3 钱包。请安装{' '}
                <a
                  className="underline"
                  href="https://www.okx.com/web3"
                  target="_blank"
                  rel="noreferrer"
                >
                  OKX Wallet
                </a>{' '}
                或 MetaMask。
              </p>
            )}

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">状态</dt>
                <dd>{wallet.address ? '已连接' : '未连接'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">网络</dt>
                <dd className={wallet.isOnXLayer ? 'text-green-400' : 'text-yellow-400'}>
                  {networkBadge}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-400">地址</dt>
                <dd>
                  {wallet.address ? (
                    <a
                      className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                      href={explorerAddressUrl(targetChain, wallet.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortenAddress(wallet.address)}
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">余额</dt>
                <dd className="font-semibold">
                  {wallet.balance ?? '—'} {(wallet.chain ?? targetChain).nativeCurrency.symbol}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2">
              {!wallet.address ? (
                <button
                  onClick={() => wallet.connect()}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  连接钱包
                </button>
              ) : (
                <>
                  {!wallet.isOnXLayer && (
                    <button
                      onClick={() => wallet.switchToXLayer(targetChain)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      <ArrowsRightLeftIcon className="w-4 h-4" /> 切换到 {targetChain.chainName}
                    </button>
                  )}
                  <button
                    onClick={() => wallet.refreshBalance()}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all"
                  >
                    刷新余额
                  </button>
                  <button
                    onClick={() => wallet.disconnect()}
                    className="w-full px-4 py-2.5 text-gray-400 text-sm hover:text-white transition-all"
                  >
                    断开连接
                  </button>
                </>
              )}
            </div>

            {wallet.error && (
              <p className="mt-3 text-xs text-red-400 break-words">{wallet.error}</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-gray-300 mb-2">关于 X Layer</p>
            X Layer 是 OKX 基于 Polygon CDK 构建的以太坊 Layer 2，原生代币为 OKB。FanBridge AI
            让球迷用一句话或一句语音完成链上操作，降低 Web3 门槛。
          </div>
        </aside>

        {/* Chat */}
        <section className="lg:col-span-2 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-[70vh] min-h-[480px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <CpuChipIcon className="w-4 h-4 text-purple-400" /> AI 助手
            </div>
            <button
              onClick={() => setSpeakReplies((v) => !v)}
              title="朗读回复"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {speakReplies ? (
                <SpeakerWaveIcon className="w-5 h-5" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-100'
                  }`}
                >
                  {m.text}
                  {m.link && (
                    <a
                      href={m.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline"
                    >
                      {m.link.label}
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {m.matches && (
                    <div className="mt-3 space-y-2">
                      {m.matches.map((match, i) => (
                        <div
                          key={i}
                          className="bg-black/20 rounded-lg p-3 text-xs border border-white/5"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold">
                              {match.home} vs {match.away}
                            </span>
                            <span className="text-gray-400">{match.time}</span>
                          </div>
                          <div className="flex gap-3 text-gray-300">
                            <span>主 {match.homeOdds}</span>
                            <span>平 {match.drawOdds}</span>
                            <span>客 {match.awayOdds}</span>
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-500">* 示例数据，仅作演示</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-400">
                  正在处理…
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-5 py-2 flex flex-wrap gap-2 border-t border-white/10">
            {quickActions.map((q) => (
              <button
                key={q.label}
                onClick={() => handleSend(q.cmd)}
                disabled={busy}
                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
            {voice.supported && (
              <button
                onClick={handleMic}
                title="语音输入"
                className={`p-2.5 rounded-xl border transition-all ${
                  voice.listening
                    ? 'bg-red-500/20 border-red-500/40 text-red-300 animate-pulse'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="问我任何事，例如：转 0.1 OKB 给 0x…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={busy || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>FanBridge AI · 数亿球迷的 Web3 入口 · Built on X Layer</span>
          <div className="flex gap-4">
            <a href="https://web3.okx.com/xlayer" target="_blank" rel="noreferrer" className="hover:text-gray-300">
              X Layer
            </a>
            <a href="https://www.oklink.com/xlayer" target="_blank" rel="noreferrer" className="hover:text-gray-300">
              区块浏览器
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

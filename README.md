# FanBridge AI — X Layer 链上经纪人

一个面向球迷的 **AI 链上助手**，让用户用一句自然语言（或语音）就能在
[X Layer](https://web3.okx.com/xlayer)（OKX 基于 Polygon CDK 构建的以太坊 L2，
原生代币 OKB）上完成钱包操作，降低 Web3 使用门槛。

Built with Next.js 14 + Tailwind CSS + TypeScript.

## 功能

- 🔗 **连接钱包** — 支持 OKX Wallet / MetaMask（注入式 EIP-1193 provider）
- 🌐 **一键切换网络** — 自动添加并切换到 X Layer 主网（196）/ 测试网（195）
- 💰 **查询余额** — 读取当前地址在 X Layer 上的 OKB 余额
- 📤 **转账 OKB** — 自然语言发起真实链上转账，如「转 0.1 OKB 给 0x…」
- ⚽ **赛事信息** — 今日热门赛事示例数据（球迷场景演示）
- 🎙️ **语音交互** — 基于浏览器 Web Speech API 的语音输入与朗读
- 🔍 **区块浏览器** — 一键在 OKLink 查看地址 / 交易

所有链上交互通过浏览器钱包完成，**无需任何 API key 即可运行**。
AI 意图解析为本地规则引擎（`lib/agent.ts`），可平滑替换为真实 LLM 后端。

## 快速开始

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，安装 OKX Wallet 或 MetaMask 后即可体验。

## 代码结构

| 文件 | 说明 |
| --- | --- |
| `lib/xlayer.ts` | X Layer 网络定义与单位换算等工具（零依赖） |
| `lib/useWallet.ts` | 钱包连接 / 切链 / 余额 / 转账的 React Hook |
| `lib/agent.ts` | 自然语言意图解析（本地规则，可换 LLM） |
| `lib/useVoice.ts` | 语音输入 / 朗读封装 |
| `app/page.tsx` | 主应用：钱包面板 + AI 对话 |

## 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

也可在 Railway 上直接 `npm run build && npm run start` 部署。

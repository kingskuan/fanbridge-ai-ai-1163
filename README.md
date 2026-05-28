# FanBridge AI — AI 球迷经纪人助手

OKX **X Layer Build X Hackathon** 参赛项目。Next.js 14 前端 + 部署在 X Layer Testnet 上的 `FanBridgeRegistry` 合约。

## Quick Start

```bash
npm install
npm run dev   # http://localhost:3000
```

## 部署到 X Layer Testnet

### 1. 准备私钥和测试币

- 私钥：一个钱包账户的私钥（**不要用主钱包**，新建一个 dev 钱包即可）
- 测试币：从 https://www.okx.com/xlayer/faucet 领取 X Layer Testnet OKB

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

填入 `.env.local`：

```
PRIVATE_KEY=0x...           # 部署用账户私钥（不带 0x 也行，hardhat 都接受）
NEXT_PUBLIC_CHAIN_ID=195
```

### 3. 编译并部署合约

```bash
npm run hh:compile
npm run hh:deploy:xlayer-testnet
```

部署成功后会输出合约地址，例如：

```
✅ FanBridgeRegistry deployed
   address: 0xabc...
   tx:      0x123...
```

地址也会写到 `deployments/xlayerTestnet.json`。

### 4. 把合约地址接入前端

把第 3 步输出的地址写入 `.env.local`：

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xabc...
```

重启 `npm run dev`，首页会出现「X Layer 链上演示」面板：连接钱包 → 注册成为粉丝 → 上链一次预测。所有 tx 都可以在 https://www.oklink.com/xlayer-test 查询。

### 5. （可选）合约源码验证

```bash
# .env.local 加上 OKLINK_API_KEY=...
npm run hh:verify:xlayer-testnet -- 0xabc...
```

## 部署前端到 Railway

仓库已配置 `railway.json`。在 Railway：

1. New Project → Deploy from GitHub → 选当前仓库
2. Variables 里加 `NEXT_PUBLIC_CONTRACT_ADDRESS` 和 `NEXT_PUBLIC_CHAIN_ID=195`
3. Generate Domain 拿公开链接

## 技术栈

- **前端**：Next.js 14 (App Router) · Tailwind CSS · Framer Motion · viem
- **合约**：Solidity 0.8.24 · Hardhat
- **链**：X Layer Testnet (chainId 195)

## 目录结构

```
contracts/FanBridgeRegistry.sol   # 链上粉丝注册 + 预测记录合约
scripts/deploy.ts                  # Hardhat 部署脚本
hardhat.config.ts                  # X Layer testnet/mainnet 网络配置
lib/xlayer.ts                      # viem chain 定义
lib/contract.ts                    # 合约 ABI
components/XLayerPanel.tsx         # 前端钱包连接 + 合约交互
app/page.tsx                       # 首页（嵌入 XLayerPanel）
```

Built by Claude Vibe Coding 🤖

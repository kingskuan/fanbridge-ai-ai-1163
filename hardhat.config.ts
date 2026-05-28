import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''
const OKLINK_API_KEY = process.env.OKLINK_API_KEY ?? ''

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC ?? 'https://testrpc.xlayer.tech',
      chainId: 195,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    xlayer: {
      url: process.env.XLAYER_RPC ?? 'https://rpc.xlayer.tech',
      chainId: 196,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      xlayerTestnet: OKLINK_API_KEY,
      xlayer: OKLINK_API_KEY,
    },
    customChains: [
      {
        network: 'xlayerTestnet',
        chainId: 195,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET',
          browserURL: 'https://www.oklink.com/xlayer-test',
        },
      },
      {
        network: 'xlayer',
        chainId: 196,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER',
          browserURL: 'https://www.oklink.com/xlayer',
        },
      },
    ],
  },
}

export default config

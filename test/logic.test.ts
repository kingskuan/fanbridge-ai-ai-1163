import { parseIntent } from '../lib/agent'
import {
  formatUnits,
  parseUnits,
  toHexQuantity,
  isAddress,
  shortenAddress,
  getChainByIdHex,
} from '../lib/xlayer'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

const ADDR = '0x1234567890abcdef1234567890abcdef12345678'

console.log('\n[xlayer unit math]')
check('parseUnits 1 OKB', parseUnits('1').toString() === '1000000000000000000')
check('parseUnits 0.25 OKB', parseUnits('0.25').toString() === '250000000000000000')
check('parseUnits 0', parseUnits('0').toString() === '0')
check('formatUnits round-trip 0.25', formatUnits(parseUnits('0.25')) === '0.25')
check('formatUnits 1', formatUnits(parseUnits('1')) === '1')
check('formatUnits trims zeros', formatUnits(BigInt('1500000000000000000')) === '1.5')
check('formatUnits precision cap', formatUnits(BigInt('1234567890000000000'), 18, 4) === '1.2345')
check('toHexQuantity 255', toHexQuantity(BigInt(255)) === '0xff')
check('toHexQuantity 0.001 OKB', toHexQuantity(parseUnits('0.001')) === '0x' + parseUnits('0.001').toString(16))

let threw = false
try { parseUnits('abc') } catch { threw = true }
check('parseUnits rejects junk', threw)
threw = false
try { parseUnits('1.0000000000000000001') } catch { threw = true }
check('parseUnits rejects >18 decimals', threw)

console.log('\n[address helpers]')
check('isAddress valid', isAddress(ADDR))
check('isAddress rejects short', !isAddress('0x123'))
check('isAddress rejects non-hex', !isAddress('0x' + 'z'.repeat(40)))
check('shortenAddress', shortenAddress(ADDR) === '0x1234…5678')

console.log('\n[chain lookup]')
check('mainnet by hex', getChainByIdHex('0xc4')?.chainId === 196)
check('testnet by hex', getChainByIdHex('0xc3')?.chainId === 195)
check('unknown chain', getChainByIdHex('0x1') === undefined)

console.log('\n[agent intent parsing]')
check('balance (zh)', parseIntent('我的余额是多少').type === 'balance')
check('balance (en)', parseIntent('what is my balance').type === 'balance')
check('connect', parseIntent('连接钱包').type === 'connect')
check('switch mainnet', (() => { const i = parseIntent('切换到 X Layer 主网'); return i.type === 'switch' && i.network === 'mainnet' })())
check('switch testnet', (() => { const i = parseIntent('切到测试网'); return i.type === 'switch' && i.network === 'testnet' })())
check('matches', parseIntent('今天有什么比赛').type === 'matches')
check('help', parseIntent('帮助').type === 'help')
check('address', parseIntent('我的钱包地址').type === 'address')
check('explorer', parseIntent('打开区块浏览器').type === 'explorer')
check('unknown fallback', parseIntent('随便聊聊天气').type === 'unknown')

const send = parseIntent(`转 0.1 OKB 给 ${ADDR}`)
check('send type', send.type === 'send')
check('send amount parsed', send.amount === '0.1', `got ${send.amount}`)
check('send address parsed', send.to === ADDR, `got ${send.to}`)

const sendEn = parseIntent(`send 0.5 OKB to ${ADDR}`)
check('send (en) amount', sendEn.amount === '0.5')
check('send (en) address', sendEn.to === ADDR)

const sendIncomplete = parseIntent('转账 0.1 OKB')
check('send without address -> prompts', sendIncomplete.type === 'send' && !sendIncomplete.to)

console.log(`\nRESULT: ${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)

import { ethers, network } from 'hardhat'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

async function main() {
  const [deployer] = await ethers.getSigners()
  const balance = await ethers.provider.getBalance(deployer.address)

  console.log(`Network:  ${network.name} (chainId=${network.config.chainId})`)
  console.log(`Deployer: ${deployer.address}`)
  console.log(`Balance:  ${ethers.formatEther(balance)} OKB`)

  const Factory = await ethers.getContractFactory('FanBridgeRegistry')
  const contract = await Factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  const txHash = contract.deploymentTransaction()?.hash

  console.log(`\n✅ FanBridgeRegistry deployed`)
  console.log(`   address: ${address}`)
  console.log(`   tx:      ${txHash}`)

  const deploymentsDir = join(__dirname, '..', 'deployments')
  if (!existsSync(deploymentsDir)) mkdirSync(deploymentsDir, { recursive: true })
  writeFileSync(
    join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(
      {
        network: network.name,
        chainId: network.config.chainId,
        contract: 'FanBridgeRegistry',
        address,
        txHash,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )

  console.log(`\nNext steps:`)
  console.log(`  1. Copy address to .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`)
  console.log(`  2. (Optional) Verify: npx hardhat verify --network ${network.name} ${address}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

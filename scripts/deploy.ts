import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey, provider);
  console.log('Deployer:', await wallet.getAddress());
  // Placeholder: Deployment would use Hardhat runtime in real scripts
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

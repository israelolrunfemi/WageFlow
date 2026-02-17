import { ethers } from 'ethers';

async function generateWallet() {
  console.log('\n🔐 Generating Celo Wallet...\n');

  const wallet = ethers.Wallet.createRandom();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏦  WALLET DETAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Address    :', wallet.address);
  console.log('Private Key:', wallet.privateKey);
  console.log('Mnemonic   :', wallet.mnemonic?.phrase);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋  NEXT STEPS:\n');
  console.log('1. Copy this line into your .env file:');
  console.log(`   PRIVATE_KEY=${wallet.privateKey}\n`);

  console.log('2. Get FREE testnet funds:');
  console.log('   → Go to: https://faucet.celo.org');
  console.log(`   → Paste:  ${wallet.address}`);
  console.log('   → Click:  Get cUSD  (wait 30s)');
  console.log('   → Click:  Get CELO  (wait 30s)\n');

  console.log('3. Check your wallet:');
  console.log(`   → https://alfajores.celoscan.io/address/${wallet.address}\n`);

  console.log('⚠️   SAVE YOUR MNEMONIC PHRASE SOMEWHERE SAFE!');
  console.log('⚠️   NEVER share your Private Key with anyone!\n');
}

generateWallet().catch(console.error);
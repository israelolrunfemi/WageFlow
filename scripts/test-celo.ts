import { celoService } from '../src/services/blockchain/celo.js';

async function testCelo() {
  console.log('\n🧪 Testing Celo Service...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Test 1: Wallet Address
    console.log('1. Wallet Address:');
    console.log('  ', celoService.getAddress());
    console.log('');

    // Test 2: Network
    console.log('2. Network Info:');
    const network = await celoService.getNetwork();
    console.log('   Name    :', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    console.log('');

    // Test 3: Balances
    console.log('3. Wallet Balances:');
    const balances = await celoService.getAllBalances();
    console.log('   cUSD :', balances.cUSD);
    console.log('   cEUR :', balances.cEUR);
    console.log('   CELO :', balances.CELO);
    console.log('');

    // Test 4: Gas Price
    console.log('4. Gas Price:');
    const gasPrice = await celoService.getGasPrice();
    console.log('  ', gasPrice);
    console.log('');

    // Test 5: Block Number
    console.log('5. Latest Block:');
    const block = await celoService.getBlockNumber();
    console.log('  ', block);
    console.log('');

    // Test 6: Address Validation
    console.log('6. Address Validation:');
    const validAddr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';
    const invalidAddr = '0xinvalid';
    console.log(`   ${validAddr}: ${celoService.isValidAddress(validAddr) ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   ${invalidAddr}: ${celoService.isValidAddress(invalidAddr) ? '✅ Valid' : '❌ Invalid'}`);
    console.log('');

    // Test 7: Explorer Links
    console.log('7. Explorer Links:');
    console.log('   Address:', celoService.getAddressLink(celoService.getAddress()));
    console.log('');

    // Test 8: Balance Check
    console.log('8. Sufficient Balance Check:');
    const hasFunds = await celoService.hasSufficientBalance('1', 'cUSD');
    console.log(`   Has 1 cUSD: ${hasFunds ? '✅ Yes' : '⚠️  No - get funds from faucet.celo.org'}`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed!\n');

    if (parseFloat(balances.cUSD) === 0) {
      console.log('💡 TIP: Your wallet has no cUSD. Get testnet funds:');
      console.log('   1. Go to https://faucet.celo.org');
      console.log('   2. Paste:', celoService.getAddress());
      console.log('   3. Click "Get cUSD" and "Get CELO"\n');
    }
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Check PRIVATE_KEY in .env is valid (starts with 0x)');
    console.log('2. Check CELO_RPC_URL in .env');
    console.log('3. Check internet connection\n');
    process.exit(1);
  }
}

testCelo();
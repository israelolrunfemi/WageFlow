import { ethers } from 'ethers';
import { env } from '../../config/env.js';
import { TOKENS, ERC20_ABI, NETWORK } from '../../config/constants.js';
import type {
  Currency,
  PaymentResult,
  BatchPaymentItem,
  BatchPaymentResult,
  WalletBalance,
} from '../../types/blockchain.js';

class CeloService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private tokens: Record<Currency, ethers.Contract>;

  constructor() {
    const rpcUrl = env.CELO_RPC_URL || NETWORK.RPC_URL;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY is required for Celo payments');
    }

    this.wallet = new ethers.Wallet(env.PRIVATE_KEY, this.provider);

    this.tokens = {
      cUSD: new ethers.Contract(TOKENS.cUSD.address, ERC20_ABI, this.wallet),
      cEUR: new ethers.Contract(TOKENS.cEUR.address, ERC20_ABI, this.wallet),
    };

    console.log('✅ Celo Service ready');
    console.log('   Network  :', NETWORK.NAME);
    console.log('   Wallet   :', this.shortenAddress(this.wallet.address));
  }

  getAddress(): string {
    return this.wallet.address;
  }

  async getBalance(currency: Currency, address?: string): Promise<string> {
    try {
      const addr = this.normalizeAddress(address ?? this.wallet.address);
      const raw = await this.tokens[currency].balanceOf(addr);
      return ethers.formatUnits(raw, TOKENS[currency].decimals);
    } catch (error: any) {
      console.error(`Failed to get ${currency} balance:`, error.message);
      throw new Error(`Could not fetch ${currency} balance`);
    }
  }

  async getCeloBalance(address?: string): Promise<string> {
    try {
      const addr = this.normalizeAddress(address ?? this.wallet.address);
      const raw = await this.provider.getBalance(addr);
      return ethers.formatEther(raw);
    } catch (error: any) {
      console.error('Failed to get CELO balance:', error.message);
      throw new Error('Could not fetch CELO balance');
    }
  }

  async getAllBalances(address?: string): Promise<WalletBalance> {
    const [cUSD, cEUR, CELO] = await Promise.all([
      this.getBalance('cUSD', address).catch(() => '0'),
      this.getBalance('cEUR', address).catch(() => '0'),
      this.getCeloBalance(address).catch(() => '0'),
    ]);

    return { cUSD, cEUR, CELO };
  }

  async hasSufficientBalance(amount: string, currency: Currency): Promise<boolean> {
    const amountUnits = this.parseAmountToUnits(amount, currency);
    if (!amountUnits) return false;

    const balance = await this.tokens[currency].balanceOf(this.wallet.address);
    return balance >= amountUnits;
  }

  async payEmployee(
    recipientAddress: string,
    amount: string,
    currency: Currency = 'cUSD'
  ): Promise<PaymentResult> {
    try {
      if (!(await this.isExpectedNetwork())) {
        return {
          success: false,
          error: `Wrong network configured. Expected chainId ${NETWORK.CHAIN_ID}`,
        };
      }

      if (!this.isValidAddress(recipientAddress)) {
        return { success: false, error: 'Invalid recipient address' };
      }

      const recipient = this.normalizeAddress(recipientAddress);
      if (recipient === this.wallet.address) {
        return { success: false, error: 'Recipient address cannot be bot wallet address' };
      }

      const amountUnits = this.parseAmountToUnits(amount, currency);
      if (!amountUnits) {
        return { success: false, error: `Invalid ${currency} amount` };
      }

      const balanceUnits = await this.tokens[currency].balanceOf(this.wallet.address);
      if (balanceUnits < amountUnits) {
        const have = ethers.formatUnits(balanceUnits, TOKENS[currency].decimals);
        const need = ethers.formatUnits(amountUnits, TOKENS[currency].decimals);
        return {
          success: false,
          error: `Insufficient ${currency}. Have ${have}, need ${need}`,
        };
      }

      const celoBalance = await this.provider.getBalance(this.wallet.address);
      if (celoBalance < ethers.parseEther('0.001')) {
        return {
          success: false,
          error: 'Insufficient CELO for gas fees. Get CELO from faucet.celo.org',
        };
      }

      console.log(`\n💸 Paying ${ethers.formatUnits(amountUnits, TOKENS[currency].decimals)} ${currency} → ${this.shortenAddress(recipient)}`);
      const tx = await this.tokens[currency].transfer(recipient, amountUnits);
      console.log('   TX Hash:', tx.hash);

      const receipt = await tx.wait(1);
      if (receipt?.status === 1) {
        console.log(`   ✅ Payment confirmed: ${this.getTxLink(receipt.hash)}`);
        return { success: true, txHash: receipt.hash };
      }

      return { success: false, error: 'Transaction reverted' };
    } catch (error: any) {
      const msg = this.parseError(error);
      console.error('   ❌ Payment failed:', msg);
      return { success: false, error: msg };
    }
  }

  async payBatch(payments: BatchPaymentItem[]): Promise<BatchPaymentResult[]> {
    if (payments.length > 100) {
      throw new Error('Batch too large. Maximum 100 payments per batch');
    }

    console.log(`\n📦 Starting batch payroll: ${payments.length} employees`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const results: BatchPaymentResult[] = [];

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      console.log(`[${i + 1}/${payments.length}] ${payment.name}`);

      const result = await this.payEmployee(payment.address, payment.amount, payment.currency);

      results.push({
        ...payment,
        success: result.success,
        txHash: result.txHash,
        error: result.error,
      });

      if (i < payments.length - 1) {
        await this.sleep(2000);
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Succeeded: ${succeeded}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return results;
  }

  async getTransaction(txHash: string) {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error: any) {
      console.error('Error getting transaction:', error.message);
      return null;
    }
  }

  async getTransactionReceipt(txHash: string) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error: any) {
      console.error('Error getting receipt:', error.message);
      return null;
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      if (feeData.gasPrice) {
        return ethers.formatUnits(feeData.gasPrice, 'gwei') + ' Gwei';
      }
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getNetwork() {
    return await this.provider.getNetwork();
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  formatAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch {
      return address;
    }
  }

  shortenAddress(address: string): string {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getTxLink(txHash: string): string {
    return `${NETWORK.EXPLORER_URL}/tx/${txHash}`;
  }

  getAddressLink(address: string): string {
    return `${NETWORK.EXPLORER_URL}/address/${address}`;
  }

  private parseError(error: any): string {
    if (error.code === 'INSUFFICIENT_FUNDS') return 'Not enough CELO for gas fees';
    if (error.code === 'NONCE_EXPIRED') return 'Transaction nonce error. Please try again';
    if (error.code === 'NETWORK_ERROR') return 'Network connection issue. Please try again';
    if (error.code === 'TIMEOUT') return 'Transaction timed out. Check the blockchain explorer';
    if (error.reason) return error.reason;
    if (error.shortMessage) return error.shortMessage;
    return error.message || 'Unknown error';
  }

  private parseAmountToUnits(amount: string, currency: Currency): bigint | null {
    if (!/^\d+(\.\d+)?$/.test(amount)) return null;

    try {
      const amountUnits = ethers.parseUnits(amount, TOKENS[currency].decimals);
      if (amountUnits <= 0n) return null;
      return amountUnits;
    } catch {
      return null;
    }
  }

  private normalizeAddress(address: string): string {
    return ethers.getAddress(address);
  }

  private async isExpectedNetwork(): Promise<boolean> {
    const network = await this.provider.getNetwork();
    return Number(network.chainId) === NETWORK.CHAIN_ID;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const celoService = new CeloService();

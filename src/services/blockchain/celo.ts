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
  private tokens: Record<string, ethers.Contract>;

  constructor() {
    // ── Provider ────────────────────────────────────────────────────────────
    this.provider = new ethers.JsonRpcProvider(env.CELO_RPC_URL);

    // ── Wallet ──────────────────────────────────────────────────────────────
    this.wallet = new ethers.Wallet(env.PRIVATE_KEY!, this.provider);

    // ── Token Contracts ─────────────────────────────────────────────────────
    this.tokens = {
      cUSD: new ethers.Contract(TOKENS.cUSD.address, ERC20_ABI, this.wallet),
      cEUR: new ethers.Contract(TOKENS.cEUR.address, ERC20_ABI, this.wallet),
    };

    console.log('✅ Celo Service ready');
    console.log('   Network  :', NETWORK.NAME);
    console.log('   Wallet   :', this.wallet.address);
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  WALLET INFO
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Get the bot's wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get single token balance
   */
  async getBalance(currency: Currency, address?: string): Promise<string> {
    try {
      const addr = address ?? this.wallet.address;
      const token = this.tokens[currency];
      const raw = await token.balanceOf(addr);
      return ethers.formatUnits(raw, TOKENS[currency].decimals);
    } catch (error: any) {
      console.error(`Failed to get ${currency} balance:`, error.message);
      throw new Error(`Could not fetch ${currency} balance`);
    }
  }

  /**
   * Get native CELO balance
   */
  async getCeloBalance(address?: string): Promise<string> {
    try {
      const addr = address ?? this.wallet.address;
      const raw = await this.provider.getBalance(addr);
      return ethers.formatEther(raw);
    } catch (error: any) {
      console.error('Failed to get CELO balance:', error.message);
      throw new Error('Could not fetch CELO balance');
    }
  }

  /**
   * Get all balances at once
   */
  async getAllBalances(address?: string): Promise<WalletBalance> {
    const [cUSD, cEUR, CELO] = await Promise.all([
      this.getBalance('cUSD', address).catch(() => '0'),
      this.getBalance('cEUR', address).catch(() => '0'),
      this.getCeloBalance(address).catch(() => '0'),
    ]);

    return { cUSD, cEUR, CELO };
  }

  /**
   * Check if wallet has enough balance
   */
  async hasSufficientBalance(amount: string, currency: Currency): Promise<boolean> {
    const balance = await this.getBalance(currency);
    return parseFloat(balance) >= parseFloat(amount);
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  PAYMENTS
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Pay a single employee
   */
  async payEmployee(
    recipientAddress: string,
    amount: string,
    currency: Currency = 'cUSD'
  ): Promise<PaymentResult> {
    try {
      console.log(`\n💸 Paying ${amount} ${currency} → ${recipientAddress}`);

      // ── Validate address ───────────────────────────────────────────────────
      if (!this.isValidAddress(recipientAddress)) {
        return { success: false, error: 'Invalid recipient address' };
      }

      // ── Check balance ──────────────────────────────────────────────────────
      const balance = await this.getBalance(currency);
      if (parseFloat(balance) < parseFloat(amount)) {
        return {
          success: false,
          error: `Insufficient ${currency}. Have ${parseFloat(balance).toFixed(2)}, need ${amount}`,
        };
      }

      // ── Check CELO for gas ─────────────────────────────────────────────────
      const celoBalance = await this.getCeloBalance();
      if (parseFloat(celoBalance) < 0.001) {
        return {
          success: false,
          error: 'Insufficient CELO for gas fees. Get CELO from faucet.celo.org',
        };
      }

      // ── Execute transfer ───────────────────────────────────────────────────
      const token = this.tokens[currency];
      const amountWei = ethers.parseUnits(amount, TOKENS[currency].decimals);

      console.log('   Sending transaction...');
      const tx = await token.transfer(recipientAddress, amountWei);
      console.log('   TX Hash:', tx.hash);

      // ── Wait for confirmation ──────────────────────────────────────────────
      console.log('   Waiting for confirmation...');
      const receipt = await tx.wait(1);

      if (receipt && receipt.status === 1) {
        console.log('   ✅ Payment confirmed!');
        console.log(`   Explorer: ${NETWORK.EXPLORER_URL}/tx/${receipt.hash}`);
        return { success: true, txHash: receipt.hash };
      }

      return { success: false, error: 'Transaction reverted' };
    } catch (error: any) {
      const msg = this.parseError(error);
      console.error('   ❌ Payment failed:', msg);
      return { success: false, error: msg };
    }
  }

  /**
   * Pay multiple employees in batch
   */
  async payBatch(payments: BatchPaymentItem[]): Promise<BatchPaymentResult[]> {
    console.log(`\n📦 Starting batch payroll: ${payments.length} employees`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const results: BatchPaymentResult[] = [];

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      console.log(`[${i + 1}/${payments.length}] ${payment.name}`);

      const result = await this.payEmployee(
        payment.address,
        payment.amount,
        payment.currency
      );

      results.push({
        ...payment,
        success: result.success,
        txHash: result.txHash,
        error: result.error,
      });

      // ── Small delay between transactions ───────────────────────────────────
      if (i < payments.length - 1) {
        await this.sleep(2000);
      }
    }

    // ── Print summary ──────────────────────────────────────────────────────
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Succeeded: ${succeeded}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return results;
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  TRANSACTION INFO
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Get transaction details by hash
   */
  async getTransaction(txHash: string) {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error: any) {
      console.error('Error getting transaction:', error.message);
      return null;
    }
  }

  /**
   * Get transaction receipt by hash
   */
  async getTransactionReceipt(txHash: string) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error: any) {
      console.error('Error getting receipt:', error.message);
      return null;
    }
  }

  /**
   * Get current gas price
   */
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

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get network info
   */
  async getNetwork() {
    return await this.provider.getNetwork();
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  HELPERS
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Check if an address is valid
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Format address to checksum format
   */
  formatAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch {
      return address;
    }
  }

  /**
   * Shorten address for display
   */
  shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Build explorer link for transaction
   */
  getTxLink(txHash: string): string {
    return `${NETWORK.EXPLORER_URL}/tx/${txHash}`;
  }

  /**
   * Build explorer link for address
   */
  getAddressLink(address: string): string {
    return `${NETWORK.EXPLORER_URL}/address/${address}`;
  }

  /**
   * Parse common ethers errors into readable messages
   */
  private parseError(error: any): string {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Not enough CELO for gas fees';
    }
    if (error.code === 'NONCE_EXPIRED') {
      return 'Transaction nonce error. Please try again';
    }
    if (error.code === 'NETWORK_ERROR') {
      return 'Network connection issue. Please try again';
    }
    if (error.code === 'TIMEOUT') {
      return 'Transaction timed out. Check the blockchain explorer';
    }
    if (error.reason) {
      return error.reason;
    }
    if (error.shortMessage) {
      return error.shortMessage;
    }
    return error.message || 'Unknown error';
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const celoService = new CeloService();
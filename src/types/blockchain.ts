export type Currency = 'cUSD' | 'cEUR';

export interface TokenConfig {
  address: string;
  decimals: number;
  symbol: Currency;
  name: string;
}

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface BatchPaymentItem {
  employeeId: number;
  name: string;
  address: string;
  amount: string;
  currency: Currency;
}

export interface BatchPaymentResult extends BatchPaymentItem {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface WalletBalance {
  cUSD: string;
  cEUR: string;
  CELO: string;
}
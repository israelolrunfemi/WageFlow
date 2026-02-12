export class Validators {
  // Validate Ethereum/Celo address
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Validate amount
  static isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }

  // Validate currency
  static isValidCurrency(currency: string): currency is 'cUSD' | 'cEUR' {
    return ['cUSD', 'cEUR'].includes(currency);
  }
}
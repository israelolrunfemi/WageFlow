export class Formatters {
  // Format currency
  static currency(amount: number | string, currency: string = 'cUSD'): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  }

  // Format wallet address
  static address(address: string): string {
    return `\`${address.slice(0, 6)}...${address.slice(-4)}\``;
  }

  // Format date
  static date(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Format transaction link
  static txLink(txHash: string, network: string = 'alfajores'): string {
    return `https://${network}.celoscan.io/tx/${txHash}`;
  }
}
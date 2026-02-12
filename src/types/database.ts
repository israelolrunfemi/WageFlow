// Re-export model types
export type { Company } from '../services/database/models/Company.js';
export type { Employee } from '../services/database/models/Employee.js';
export type { Payment } from '../services/database/models/Payment.js';

// Custom types
export interface EmployeeWithPayments {
  id: number;
  name: string;
  walletAddress: string;
  salaryAmount: number;
  preferredCurrency: string;
  payments: Array<{
    id: number;
    amount: number;
    currency: string;
    txHash: string;
    createdAt: Date;
  }>;
}
import type { Employee } from '../database/models/Employee.js';

export interface PayrollContext {
  companyName: string;
  employeeCount: number;
  monthlyPayrollByCurrency: Record<string, number>;
  employees: Pick<Employee, 'name' | 'salaryAmount' | 'preferredCurrency'>[];
}

function formatPayrollByCurrency(monthlyPayrollByCurrency: Record<string, number>): string {
  const entries = Object.entries(monthlyPayrollByCurrency);
  if (entries.length === 0) return 'No payroll data available yet.';

  return entries.map(([currency, amount]) => `${currency}: ${amount.toFixed(2)}`).join(', ');
}

export function buildSystemPrompt(): string {
  return [
    'You are WageFlow AI, a smart payroll copilot inside a Telegram bot.',
    'Be concise, practical, and friendly.',
    'Focus on payroll operations, team management, Celo cUSD/cEUR context, and risk checks.',
    'If user asks unrelated topics, politely redirect to payroll, HR ops, and crypto payroll concerns.',
    'Never claim to execute blockchain transfers yourself; instruct the user to use bot commands like /pay.',
    'When giving steps, format them as short numbered lists.',
  ].join(' ');
}

export function buildUserPrompt(userMessage: string, context: PayrollContext): string {
  return [
    `User message: "${userMessage}"`,
    '',
    'Current WageFlow context:',
    `- Company: ${context.companyName}`,
    `- Active employees: ${context.employeeCount}`,
    `- Monthly payroll by currency: ${formatPayrollByCurrency(context.monthlyPayrollByCurrency)}`,
    `- Employees: ${
      context.employees.length
        ? context.employees
            .map(
              (employee) =>
                `${employee.name} (${Number(employee.salaryAmount).toFixed(2)} ${employee.preferredCurrency})`
            )
            .join(', ')
        : 'none'
    }`,
    '',
    'Give a helpful response aligned to this context. Keep it under 120 words.',
  ].join('\n');
}

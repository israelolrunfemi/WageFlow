import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { Company, Employee } from '../database/index.js';
import { buildSystemPrompt, buildUserPrompt, type PayrollContext } from './prompts.js';

interface EmployeeSnapshot {
  name: string;
  salaryAmount: number;
  preferredCurrency: string;
}

const DEFAULT_MODEL = 'gemini-2.0-flash';

export class WageFlowAIAgent {
  private readonly client: GoogleGenAI | null;

  constructor() {
    this.client = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;
  }

  isEnabled(): boolean {
    return Boolean(this.client);
  }

  async reply(telegramId: number, userMessage: string): Promise<string | null> {
    if (!this.client) return null;

    const context = await this.fetchPayrollContext(telegramId);
    const response = await this.client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: buildUserPrompt(userMessage, context),
      config: {
        systemInstruction: buildSystemPrompt(),
        temperature: 0.5,
        maxOutputTokens: 220,
      },
    });

    return response.text?.trim() || null;
  }

  private async fetchPayrollContext(telegramId: number): Promise<PayrollContext> {
    const company = await Company.findOne({
      where: { telegramId: BigInt(telegramId) },
      include: [
        {
          model: Employee,
          as: 'employees',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    const employees = (company?.employees || []) as EmployeeSnapshot[];

    const monthlyPayrollByCurrency = employees.reduce<Record<string, number>>((acc, employee) => {
      const currency = employee.preferredCurrency;
      acc[currency] = (acc[currency] || 0) + Number(employee.salaryAmount);
      return acc;
    }, {});

    return {
      companyName: company?.name || 'Unknown company',
      employeeCount: employees.length,
      monthlyPayrollByCurrency,
      employees: employees.map((employee) => ({
        name: employee.name,
        salaryAmount: Number(employee.salaryAmount),
        preferredCurrency: employee.preferredCurrency,
      })),
    };
  }
}

export const wageFlowAIAgent = new WageFlowAIAgent();

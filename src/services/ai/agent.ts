import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { Company, Employee } from '../database/index.js';
import { buildSystemPrompt, buildUserPrompt, type PayrollContext } from './prompts.js';

interface EmployeeSnapshot {
  name: string;
  salaryAmount: number;
  preferredCurrency: string;
}

const DEFAULT_MODEL = env.GEMINI_MODEL || 'gemini-2.0-flash';
const FALLBACK_MODELS = [DEFAULT_MODEL, 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

function uniqueModels(models: string[]): string[] {
  return [...new Set(models.filter(Boolean))];
}

export class WageFlowAIAgent {
  private readonly client: GoogleGenerativeAI | null;

  constructor() {
    this.client = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
  }

  isEnabled(): boolean {
    return Boolean(this.client);
  }

  async reply(telegramId: number, userMessage: string): Promise<string | null> {
    if (!this.client) return null;

    const context = await this.fetchPayrollContext(telegramId);
    const prompt = buildUserPrompt(userMessage, context);

    for (const modelName of uniqueModels(FALLBACK_MODELS)) {
      try {
        const model = this.client.getGenerativeModel({
          model: modelName,
          systemInstruction: buildSystemPrompt(),
        });

        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 220,
          },
        });

        const text = response.response.text().trim();
        if (text) return text;
      } catch (error: any) {
        const status = error?.status;
        if (status === 404) {
          console.warn(`Gemini model unavailable: ${modelName}. Trying fallback model...`);
          continue;
        }
        throw error;
      }
    }

    return null;
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

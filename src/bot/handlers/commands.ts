import type { BotContext } from '../../types/bot.js';
import { Company, Employee } from '../../services/database/index.js';
import { Formatters } from '../utils/formatters.js';
import { APP_NAME } from '../../config/constants.js';
import { celoService } from '../../services/blockchain/celo.js';

interface EmployeeSummary {
  name: string;
  salaryAmount: number | string;
  preferredCurrency: string;
}

export class CommandHandlers {
  // /start command
  static async start(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const company = await Company.findOne({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!company) {
      await ctx.reply(
        `👋 Welcome to ${APP_NAME}!\n\n` +
          'I help you pay your team instantly on Celo.\n\n' +
          "Let's set up your company. What's your company name?"
      );
      ctx.session.state = 'awaiting_company_name';
    } else {
      await ctx.reply(
        `Welcome back, ${company.name}! 🎉\n\n` +
          'Commands:\n' +
          '/add_employee - Add team member\n' +
          '/employees - View your team\n' +
          '/pay - Pay everyone\n' +
          '/balance - Check balance\n' +
          '/pin - Set PIN\n' +
          '/help - Show help'
      );
    }
  }

  // /help command
  static async help(ctx: BotContext) {
    await ctx.reply(
      `🤖 ${APP_NAME} Help\n\n` +
        '📝 COMMANDS:\n' +
        '/start - Set up your company\n' +
        '/add_employee - Add team member\n' +
        '/employees - View your team\n' +
        '/pay - Pay everyone\n' +
        '/balance - Check wallet balance\n' +
        '/pin - Set your PIN\n' +
        '/new_pin - Change PIN\n' +
        '/help - Show this message\n\n' +
        '💰 SUPPORTED CURRENCIES:\n' +
        '• cUSD (Celo Dollar)\n' +
        '• cEUR (Celo Euro)\n\n' +
        '🔗 USEFUL LINKS:\n' +
        'Celoscan: https://alfajores.celoscan.io\n' +
        'Get testnet cUSD: https://faucet.celo.org'
    );
  }

  // /add_employee command
  static async addEmployee(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const company = await Company.findOne({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!company) {
      return ctx.reply('Please set up your company first with /start');
    }

    await ctx.reply("What's the employee's full name? 👤");
    ctx.session.state = 'employee_name';
    ctx.session.companyId = company.id;
    ctx.session.employee = {};
  }

  // /employees command
  static async listEmployees(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

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

    if (!company) {
      return ctx.reply('Set up your company first: /start');
    }

    if (!company.employees || company.employees.length === 0) {
      return ctx.reply('No employees yet! Add one with /add_employee');
    }

    let message = `👥 Your Team (${company.employees.length})\n\n`;
    let total = 0;

    company.employees.forEach((emp, idx) => {
      message += `${idx + 1}. ${emp.name}\n`;
      message += `   💰 ${Formatters.currency(Number(emp.salaryAmount), emp.preferredCurrency)}\n`;
      message += `   💳 ${Formatters.address(emp.walletAddress)}\n\n`;
      total += Number(emp.salaryAmount);
    });

    message += `📊 Total monthly payroll: ${Formatters.currency(total, 'cUSD')}`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  // /balance command
  static async checkBalance(ctx: BotContext) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

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

  if (!company) {
    return ctx.reply('Set up your company first with /start');
  }

  await ctx.reply('⏳ Checking wallet balances...');

  try {
    // Get all balances
    const walletAddress = celoService.getAddress();
    const balances = await celoService.getAllBalances();

    // Calculate total payroll
    const totalPayroll = (company.employees || []).reduce(
      (sum: number, emp: any) => sum + parseFloat(emp.salaryAmount),
      0
    );

    // Calculate by currency
    const byCurrency: Record<string, number> = {};
    (company.employees || []).forEach((emp: any) => {
      const c = emp.preferredCurrency;
      byCurrency[c] = (byCurrency[c] || 0) + parseFloat(emp.salaryAmount);
    });

    let message = `💰 Wallet Balance\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📍 Address: ${celoService.shortenAddress(walletAddress)}\n\n`;

    message += `📊 Balances:\n`;
    message += `   cUSD : ${parseFloat(balances.cUSD).toFixed(2)}\n`;
    message += `   cEUR : ${parseFloat(balances.cEUR).toFixed(2)}\n`;
    message += `   CELO : ${parseFloat(balances.CELO).toFixed(4)}\n\n`;

    message += `📋 Payroll Required:\n`;
    Object.entries(byCurrency).forEach(([currency, amount]) => {
      const bal = currency === 'cUSD' ? balances.cUSD : balances.cEUR;
      const isEnough = parseFloat(bal) >= amount;
      message += `   ${currency}: ${amount.toFixed(2)} ${isEnough ? '✅' : '⚠️ Low'}\n`;
    });

    message += `\n🔗 View on Explorer:\n`;
    message += `${celoService.getAddressLink(walletAddress)}`;

    await ctx.reply(message);
  } catch (error: any) {
    console.error('Balance check error:', error);
    await ctx.reply(
      '❌ Could not fetch balance.\n\n' +
        'Check your RPC connection and try again.'
    );
  }
}

  // /pay command
  static async pay(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

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

    if (!company) {
      return ctx.reply('Set up your company first: /start');
    }

    if (!company.employees || company.employees.length === 0) {
      return ctx.reply('No employees! Add with /add_employee');
    }

    const total = company.employees.reduce((sum, emp) => sum + Number(emp.salaryAmount), 0);

    let summary = '📊 Payroll Summary\n\n';

    const byCurrency: Record<string, { employees: EmployeeSummary[]; total: number }> = {};

    company.employees.forEach((emp) => {
      const currency = emp.preferredCurrency;
      if (!byCurrency[currency]) {
        byCurrency[currency] = { employees: [], total: 0 };
      }
      byCurrency[currency].employees.push(emp);
      byCurrency[currency].total += Number(emp.salaryAmount);
    });

    Object.entries(byCurrency).forEach(([currency, data]) => {
      summary += `${currency}:\n`;
      data.employees.forEach((emp) => {
        summary += `• ${emp.name}: ${Formatters.currency(Number(emp.salaryAmount), currency)}\n`;
      });
      summary += `Subtotal: ${Formatters.currency(data.total, currency)}\n\n`;
    });

    summary += `💰 Total: ${Formatters.currency(total, 'cUSD')}\n\n`;
    summary += `Confirm payment?`;

    await ctx.reply(summary, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm & Pay', callback_data: 'confirm_pay' },
            { text: '❌ Cancel', callback_data: 'cancel_pay' },
          ],
        ],
      },
    });
  }

  // /pin command
  static async setPin(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const company = await Company.findOne({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!company) {
      return ctx.reply('Set up your company first: /start');
    }

    await ctx.reply(
      '🔐 Set Your PIN\n\n' +
        'Please enter a 4-digit PIN to secure your account:\n\n' +
        '⚠️ This PIN will be required for sensitive operations like payments.'
    );

    ctx.session.state = 'await_pin';
  }

  // /new_pin command
  static async changePin(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const company = await Company.findOne({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!company) {
      return ctx.reply('Set up your company first: /start');
    }

    await ctx.reply(
      '🔐 Change Your PIN\n\n' +
        'Please enter your new 4-digit PIN:\n\n' +
        '⚠️ Make sure to remember this PIN!'
    );

    ctx.session.state = 'await_new_pin';
  }
}
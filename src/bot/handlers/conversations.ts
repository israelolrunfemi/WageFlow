import type { BotContext } from '../../types/bot.js';
import { Company, Employee } from '../../services/database/index.js';
import { Validators } from '../utils/validators.js';

export class ConversationHandlers {
  static async handleText(ctx: BotContext) {
    const message = ctx.message;
    const text = message && 'text' in message ? (message.text as string | undefined) : undefined;
    if (!text) return;

    const state = ctx.session.state;

    switch (state) {
      case 'awaiting_company_name':
        return this.handleCompanyName(ctx, text);
      case 'employee_name':
        return this.handleEmployeeName(ctx, text);
      case 'employee_wallet':
        return this.handleEmployeeWallet(ctx, text);
      case 'employee_salary':
        return this.handleEmployeeSalary(ctx, text);
      case 'await_pin':
        return this.handleSetPin(ctx, text);
      case 'await_new_pin':
        return this.handleChangePin(ctx, text);
      default:
        await ctx.reply("I didn't understand that. Try /help");
    }
  }

  // Handle company name
  private static async handleCompanyName(ctx: BotContext, name: string) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const company = await Company.create({
      telegramId: BigInt(telegramId),
      name: name,
      walletAddress: null,
    });

    await ctx.reply(
      `✅ Company "${company.name}" created!\n\n` + 'Now add your first employee:\n/add_employee'
    );

    ctx.session.state = null;
  }

  // Handle employee name
  private static async handleEmployeeName(ctx: BotContext, name: string) {
    if (!ctx.session.employee) ctx.session.employee = {};
    ctx.session.employee.name = name;

    await ctx.reply(
      "What's their Celo wallet address? 💳\n\n" +
        'Example: 0x1234567890123456789012345678901234567890\n\n' +
        'Or type "skip" to use a placeholder'
    );

    ctx.session.state = 'employee_wallet';
  }

  // Handle employee wallet
  private static async handleEmployeeWallet(ctx: BotContext, wallet: string) {
    if (!ctx.session.employee) ctx.session.employee = {};

    if (wallet.toLowerCase() === 'skip') {
      wallet = `0x${'0'.repeat(40)}`;
    }

    if (!Validators.isValidAddress(wallet)) {
      return ctx.reply(
        '❌ Invalid wallet address. Please try again:\n\n' +
          'Format: 0x followed by 40 hexadecimal characters\n' +
          'Or type "skip"'
      );
    }

    ctx.session.employee.wallet = wallet;
    await ctx.reply('Monthly salary in USD? 💰\n\nExample: 5000');
    ctx.session.state = 'employee_salary';
  }

  // Handle employee salary
  private static async handleEmployeeSalary(ctx: BotContext, salary: string) {
    if (!ctx.session.employee) ctx.session.employee = {};

    const salaryAmount = parseFloat(salary);

    if (!Validators.isValidAmount(salary)) {
      return ctx.reply('❌ Invalid amount. Please enter a valid number:\n\nExample: 5000');
    }

    ctx.session.employee.salary = salaryAmount;

    await ctx.reply('Which currency?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💵 cUSD', callback_data: 'currency_cUSD' },
            { text: '💶 cEUR', callback_data: 'currency_cEUR' },
          ],
        ],
      },
    });

    ctx.session.state = 'employee_currency';
  }

  // Handle PIN
  private static async handleSetPin(ctx: BotContext, pin: string) {
    if (!/^\d{4}$/.test(pin)) {
      return ctx.reply('❌ Invalid PIN. Please enter exactly 4 digits:');
    }

    ctx.session.pin = pin;
    await ctx.reply(
      '✅ PIN set successfully!\n\n' +
        '🔐 Your account is now secured.\n' +
        'You will need this PIN for sensitive operations.'
    );

    ctx.session.state = null;
  }

  // Handle change PIN
  private static async handleChangePin(ctx: BotContext, pin: string) {
    if (!/^\d{4}$/.test(pin)) {
      return ctx.reply('❌ Invalid PIN. Please enter exactly 4 digits:');
    }

    ctx.session.pin = pin;
    await ctx.reply('✅ PIN changed successfully!\n\n' + '🔐 Your new PIN is now active.');

    ctx.session.state = null;
  }
}
import type { BotContext } from '../../types/bot.js';
import { Company, Employee, Payment } from '../../services/database/index.js';

export class CallbackHandlers {
  static async handleCallback(ctx: BotContext) {
    const callback = ctx.callbackQuery;
    const data = callback && 'data' in callback ? (callback.data as string | undefined) : undefined;
    if (!data) return;

    await ctx.answerCbQuery();

    switch (data) {
      case 'currency_cUSD':
        return this.handleCurrencySelection(ctx, 'cUSD');
      case 'currency_cEUR':
        return this.handleCurrencySelection(ctx, 'cEUR');
      case 'confirm_pay':
        return this.handleConfirmPay(ctx);
      case 'cancel_pay':
        return this.handleCancelPay(ctx);
      default:
        await ctx.reply('Unknown action');
    }
  }

  private static async handleCurrencySelection(ctx: BotContext, currency: 'cUSD' | 'cEUR') {
    const companyId = ctx.session.companyId;
    const employee = ctx.session.employee;

    if (!companyId || !employee?.name || !employee?.wallet || !employee?.salary) {
      return ctx.editMessageText('❌ Session expired. Please try /add_employee again');
    }

    const newEmployee = await Employee.create({
      companyId: companyId,
      name: employee.name,
      walletAddress: employee.wallet,
      salaryAmount: employee.salary,
      preferredCurrency: currency,
    });

    await ctx.editMessageText(
      `✅ Employee added!\n\n` +
        `Name: ${newEmployee.name}\n` +
        `Salary: ${newEmployee.salaryAmount} ${newEmployee.preferredCurrency}/month\n\n` +
        'Add another employee: /add_employee\n' +
        'Or pay everyone: /pay'
    );

    ctx.session.state = null;
    ctx.session.employee = undefined;
    ctx.session.companyId = undefined;
  }

  private static async handleConfirmPay(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    await ctx.editMessageText('⏳ Processing payments...\nThis may take a moment.');

    try {
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

      if (!company || !company.employees) {
        return ctx.editMessageText('❌ Company not found');
      }

      let successCount = 0;
      const results: Array<{ name: string; success: boolean; txHash?: string }> = [];

      for (const emp of company.employees) {
        try {
          const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

          await Payment.create({
            companyId: company.id,
            employeeId: emp.id,
            amount: Number(emp.salaryAmount),
            currency: emp.preferredCurrency,
            txHash: mockTxHash,
            status: 'completed',
          });

          results.push({ name: emp.name, success: true, txHash: mockTxHash });
          successCount++;
        } catch (error) {
          console.error(`Failed to pay ${emp.name}:`, error);
          results.push({ name: emp.name, success: false });
        }
      }

      let message = `✅ Payroll Complete!\n\n`;
      message += `Successful: ${successCount}/${company.employees.length}\n\n`;

      results.forEach((r) => {
        message += r.success ? `✅ ${r.name}\n` : `❌ ${r.name} (failed)\n`;
      });

      message += `\n💡 Note: This is a demo. Integrate Celo service for real payments.`;

      await ctx.editMessageText(message);
    } catch (error) {
      console.error('Payroll error:', error);
      await ctx.editMessageText('❌ Payment failed. Please try again.');
    }
  }

  private static async handleCancelPay(ctx: BotContext) {
    await ctx.editMessageText('❌ Payment cancelled.');
  }
}
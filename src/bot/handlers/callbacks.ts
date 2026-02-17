import type { BotContext } from '../../types/bot.js';
import { Company, Employee, Payment } from '../../services/database/index.js';
import { celoService } from '../../services/blockchain/celo.js';
import { NETWORK } from '../../config/constants.js';
import type { BatchPaymentItem, Currency } from '../../types/blockchain.js';

export class CallbackHandlers {
  static async handleCallback(ctx: BotContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    await ctx.answerCbQuery();

    switch (data) {
      case 'currency_cUSD':
          return CallbackHandlers.handleCurrencySelection(ctx, 'cUSD');
      case 'currency_cEUR':
      return CallbackHandlers.handleCurrencySelection(ctx, 'cEUR');
      case 'confirm_pay':
       return CallbackHandlers.handleConfirmPay(ctx);
      case 'cancel_pay':
        return CallbackHandlers.handleCancelPay(ctx);
      default:
        await ctx.reply('Unknown action. Please try again.');
    }
  }

  // ── Currency Selection ────────────────────────────────────────────────────
  private static async handleCurrencySelection(ctx: BotContext, currency: Currency) {
    const companyId = ctx.session.companyId;
    const employee = ctx.session.employee;

    if (!companyId || !employee?.name || !employee?.wallet || !employee?.salary) {
      return ctx.editMessageText('❌ Session expired. Please run /add_employee again.');
    }

    const newEmployee = await Employee.create({
      companyId,
      name: employee.name,
      walletAddress: employee.wallet,
      salaryAmount: employee.salary,
      preferredCurrency: currency,
    });

    await ctx.editMessageText(
      `✅ Employee Added!\n\n` +
        `👤 Name   : ${newEmployee.name}\n` +
        `💰 Salary : ${newEmployee.salaryAmount} ${newEmployee.preferredCurrency}/month\n` +
        `💳 Wallet : ${celoService.shortenAddress(newEmployee.walletAddress)}\n\n` +
        `➕ Add another: /add_employee\n` +
        `💸 Pay team: /pay`
    );

    // Reset session
    ctx.session.state = null;
    ctx.session.employee = undefined;
    ctx.session.companyId = undefined;
  }

  // ── Confirm Payment ───────────────────────────────────────────────────────
  private static async handleConfirmPay(ctx: BotContext) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Update message to show processing
    await ctx.editMessageText(
      '⏳ Processing payroll...\n\nPlease wait while transactions are confirmed on Celo.'
    );

    try {
      // ── Get company and employees ────────────────────────────────────────
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
        return ctx.editMessageText('❌ Company not found. Please run /start first.');
      }

      if (!company.employees || company.employees.length === 0) {
        return ctx.editMessageText('❌ No active employees found. Add with /add_employee.');
      }

      // ── Check company wallet balance ─────────────────────────────────────
      await ctx.editMessageText(
        `⏳ Checking balances...\n\n` +
          `Processing ${company.employees.length} employee(s).`
      );

      const balances = await celoService.getAllBalances();

      // ── Build payments list ──────────────────────────────────────────────
      const payments: BatchPaymentItem[] = company.employees.map((emp) => ({
        employeeId: emp.id,
        name: emp.name,
        address: emp.walletAddress,
        amount: emp.salaryAmount.toString(),
        currency: emp.preferredCurrency as Currency,
      }));

      // ── Process payments ─────────────────────────────────────────────────
      await ctx.editMessageText(
        `💸 Sending payments...\n\n` +
          `Processing ${payments.length} transaction(s) on Celo.\n` +
          `This may take a moment.`
      );

      const results = await celoService.payBatch(payments);

      // ── Save results to database ─────────────────────────────────────────
      for (const result of results) {
        if (result.success && result.txHash) {
          await Payment.create({
            companyId: company.id,
            employeeId: result.employeeId,
            amount: parseFloat(result.amount),
            currency: result.currency,
            txHash: result.txHash,
            status: 'completed',
          });

          // ── Notify employee if they have Telegram ──────────────────────
          const emp = company.employees.find((e) => e.id === result.employeeId);
          if (emp?.telegramId) {
            try {
              await ctx.telegram.sendMessage(
                emp.telegramId.toString(),
                `💰 Payment Received!\n\n` +
                  `From   : ${company.name}\n` +
                  `Amount : ${result.amount} ${result.currency}\n\n` +
                  `🔗 View transaction:\n${celoService.getTxLink(result.txHash)}`
              );
            } catch {
              // Employee may not have started the bot
            }
          }
        } else {
          // Save failed payments too for records
          await Payment.create({
            companyId: company.id,
            employeeId: result.employeeId,
            amount: parseFloat(result.amount),
            currency: result.currency,
            txHash: 'failed',
            status: 'failed',
          });
        }
      }

      // ── Build summary message ────────────────────────────────────────────
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      let message = `📊 Payroll Complete!\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `✅ Paid    : ${succeeded.length}/${results.length}\n`;

      if (failed.length > 0) {
        message += `❌ Failed  : ${failed.length}/${results.length}\n`;
      }

      message += `\n👥 Results:\n`;

      for (const result of results) {
        if (result.success && result.txHash) {
          message += `\n✅ ${result.name}\n`;
          message += `   ${result.amount} ${result.currency}\n`;
          message += `   🔗 ${celoService.getTxLink(result.txHash)}\n`;
        } else {
          message += `\n❌ ${result.name}\n`;
          message += `   Error: ${result.error}\n`;
        }
      }

      message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📜 View history: /history`;

      await ctx.editMessageText(message);
    } catch (error: any) {
      console.error('Payroll error:', error);
      await ctx.editMessageText(
        `❌ Payroll failed\n\n` +
          `Error: ${error.message}\n\n` +
          `Please try again or check your wallet balance with /balance`
      );
    }
  }

  // ── Cancel Payment ────────────────────────────────────────────────────────
  private static async handleCancelPay(ctx: BotContext) {
    await ctx.editMessageText('❌ Payroll cancelled. No payments were made.');
  }
}
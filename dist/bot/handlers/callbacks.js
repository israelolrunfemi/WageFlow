// import { prisma } from '../../services/database/index.js';
export class CallbackHandlers {
    // Handle all callback queries (button clicks)
    static async handleCallback(ctx) {
        const data = ctx.callbackQuery?.data;
        if (!data)
            return;
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
    // Handle currency selection
    static async handleCurrencySelection(ctx, currency) {
        const companyId = ctx.session.companyId;
        const employee = ctx.session.employee;
        if (!companyId || !employee?.name || !employee?.wallet || !employee?.salary) {
            return ctx.editMessageText('❌ Session expired. Please try /add_employee again');
        }
        // Create employee
        const newEmployee = await prisma.employee.create({
            data: {
                companyId: companyId,
                name: employee.name,
                walletAddress: employee.wallet,
                salaryAmount: employee.salary,
                preferredCurrency: currency,
            },
        });
        await ctx.editMessageText(`✅ Employee added!\n\n` +
            `Name: ${newEmployee.name}\n` +
            `Salary: ${newEmployee.salaryAmount} ${newEmployee.preferredCurrency}/month\n\n` +
            'Add another employee: /add_employee\n' +
            'Or pay everyone: /pay');
        // Reset session
        ctx.session.state = null;
        ctx.session.employee = undefined;
        ctx.session.companyId = undefined;
    }
    // Handle confirm payment
    static async handleConfirmPay(ctx) {
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        await ctx.editMessageText('⏳ Processing payments...\nThis may take a moment.');
        try {
            const company = await prisma.company.findUnique({
                where: { telegramId: BigInt(telegramId) },
                include: {
                    employees: {
                        where: { status: 'active' },
                    },
                },
            });
            if (!company) {
                return ctx.editMessageText('❌ Company not found');
            }
            let successCount = 0;
            let failCount = 0;
            const results = [];
            // Process each employee
            for (const emp of company.employees) {
                try {
                    // TODO: Integrate with Celo blockchain service
                    // For now, create a mock transaction hash
                    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
                    // Record payment in database
                    await prisma.payment.create({
                        data: {
                            companyId: company.id,
                            employeeId: emp.id,
                            amount: emp.salaryAmount,
                            currency: emp.preferredCurrency,
                            txHash: mockTxHash,
                            status: 'completed',
                        },
                    });
                    results.push({ name: emp.name, success: true, txHash: mockTxHash });
                    successCount++;
                }
                catch (error) {
                    console.error(`Failed to pay ${emp.name}:`, error);
                    results.push({ name: emp.name, success: false });
                    failCount++;
                }
            }
            // Summary message
            let message = `✅ Payroll Complete!\n\n`;
            message += `Successful: ${successCount}/${company.employees.length}\n`;
            if (failCount > 0) {
                message += `Failed: ${failCount}\n\n`;
            }
            results.forEach((r) => {
                if (r.success) {
                    message += `✅ ${r.name}\n`;
                }
                else {
                    message += `❌ ${r.name} (failed)\n`;
                }
            });
            message += `\n💡 Note: This is a demo. Integrate Celo service for real payments.`;
            await ctx.editMessageText(message);
        }
        catch (error) {
            console.error('Payroll error:', error);
            await ctx.editMessageText('❌ Payment failed. Please try again.');
        }
    }
    // Handle cancel payment
    static async handleCancelPay(ctx) {
        await ctx.editMessageText('❌ Payment cancelled.');
    }
}
//# sourceMappingURL=callbacks.js.map
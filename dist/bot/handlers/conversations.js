import { prisma } from '../../services/database/index.js';
import { Validators } from '../utils/validators.js';
export class ConversationHandlers {
    // Handle all text messages based on conversation state
    static async handleText(ctx) {
        const text = ctx.message?.text;
        if (!text)
            return;
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
            default:
                // If no state, just ignore or show help
                await ctx.reply("I didn't understand that. Try /help to see available commands.");
        }
    }
    // Handle company name input
    static async handleCompanyName(ctx, name) {
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        // Create company
        const company = await prisma.company.create({
            data: {
                telegramId: BigInt(telegramId),
                name: name,
                walletAddress: null, // Will be set later
            },
        });
        await ctx.reply(`✅ Company "${company.name}" created!\n\n` +
            'Now add your first employee:\n' +
            '/add_employee');
        ctx.session.state = null;
    }
    // Handle employee name input
    static async handleEmployeeName(ctx, name) {
        if (!ctx.session.employee)
            ctx.session.employee = {};
        ctx.session.employee.name = name;
        await ctx.reply("What's their Celo wallet address? 💳\n\n" +
            'Example: 0x1234567890123456789012345678901234567890\n\n' +
            'Or type "skip" to use a placeholder');
        ctx.session.state = 'employee_wallet';
    }
    // Handle employee wallet input
    static async handleEmployeeWallet(ctx, wallet) {
        if (!ctx.session.employee)
            ctx.session.employee = {};
        // Allow "skip" for testing
        if (wallet.toLowerCase() === 'skip') {
            wallet = `0x${'0'.repeat(40)}`; // Placeholder address
        }
        // Validate wallet address
        if (!Validators.isValidAddress(wallet)) {
            return ctx.reply('❌ Invalid wallet address. Please try again:\n\n' +
                'Format: 0x followed by 40 hexadecimal characters\n' +
                'Or type "skip" to use a placeholder');
        }
        ctx.session.employee.wallet = wallet;
        await ctx.reply('Monthly salary in USD? 💰\n\nExample: 5000');
        ctx.session.state = 'employee_salary';
    }
    // Handle employee salary input
    static async handleEmployeeSalary(ctx, salary) {
        if (!ctx.session.employee)
            ctx.session.employee = {};
        const salaryAmount = parseFloat(salary);
        // Validate salary
        if (!Validators.isValidAmount(salary)) {
            return ctx.reply('❌ Invalid amount. Please enter a valid number:\n\nExample: 5000');
        }
        ctx.session.employee.salary = salaryAmount;
        // Ask for currency preference
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
}
//# sourceMappingURL=conversations.js.map
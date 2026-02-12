import { APP_NAME } from '../../config/constants.js';
export class CommandHandlers {
    static async start(ctx) {
        await ctx.reply(`👋 Welcome to ${APP_NAME}!\n\n` +
            `I help you manage payroll on Celo.\n\n` +
            `What’s your company name?`);
        ctx.session.state = 'awaiting_company_name';
    }
    static async help(ctx) {
        await ctx.reply(`🤖 ${APP_NAME} Help\n\n` +
            `Available Commands:\n` +
            `/start - Start setup\n` +
            `/add_employee - Add team member\n` +
            `/employees - View employees\n` +
            `/pay - Run payroll\n` +
            `/balance - Check balance\n` +
            `/pin - Set PIN\n` +
            `/new_pin - Change PIN\n` +
            `/help - Show help`);
    }
    static async addEmployee(ctx) {
        await ctx.reply("What's the employee's full name? 👤");
        ctx.session.state = 'employee_name';
    }
    static async listEmployees(ctx) {
        await ctx.reply(`👥 Employees\n\n` +
            `No database connected yet.\n` +
            `This will list active employees.`);
    }
    static async pay(ctx) {
        await ctx.reply(`📊 Payroll Summary\n\n` +
            `No database connected yet.\n\n` +
            `Confirm payment?`, {
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
    static async checkBalance(ctx) {
        await ctx.reply(`💰 Company Wallet\n\n` +
            `Balance checking not connected yet.\n`);
    }
    static async setPin(ctx) {
        await ctx.reply(`🔐 Set Your PIN\n\n` +
            `Please enter a 4-digit PIN.`);
        ctx.session.state = 'await_pin';
    }
    static async changePin(ctx) {
        await ctx.reply(`🔐 Change PIN\n\n` +
            `Enter your new 4-digit PIN.`);
        ctx.session.state = 'await_new_pin';
    }
}
//# sourceMappingURL=commands.js.map
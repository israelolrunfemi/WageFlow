import type { BotContext } from '../../types/bot.js';
export declare class ConversationHandlers {
    static handleText(ctx: BotContext): Promise<void | import("@telegraf/types").Message.TextMessage>;
    private static handleCompanyName;
    private static handleEmployeeName;
    private static handleEmployeeWallet;
    private static handleEmployeeSalary;
}

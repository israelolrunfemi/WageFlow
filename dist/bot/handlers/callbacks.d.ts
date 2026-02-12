import type { BotContext } from '../../types/bot.js';
export declare class CallbackHandlers {
    static handleCallback(ctx: BotContext): Promise<true | void | (import("@telegraf/types").Update.Edited & import("@telegraf/types").Message.TextMessage)>;
    private static handleCurrencySelection;
    private static handleConfirmPay;
    private static handleCancelPay;
}

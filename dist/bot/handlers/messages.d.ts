import type { BotContext } from '../../types/bot.js';
export declare class MessageHandlers {
    static handleText(ctx: BotContext): Promise<void | import("@telegraf/types").Message.TextMessage>;
}

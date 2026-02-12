import type { BotContext } from '../../types/bot.js';
export declare class CommandHandlers {
    static start(ctx: BotContext): Promise<void>;
    static help(ctx: BotContext): Promise<void>;
    static addEmployee(ctx: BotContext): Promise<void>;
    static listEmployees(ctx: BotContext): Promise<void>;
    static pay(ctx: BotContext): Promise<void>;
    static checkBalance(ctx: BotContext): Promise<void>;
    static setPin(ctx: BotContext): Promise<void>;
    static changePin(ctx: BotContext): Promise<void>;
}

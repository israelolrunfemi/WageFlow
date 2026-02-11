import type { Context } from 'telegraf';
import type { SessionData } from './session.js';
export interface BotContext extends Context {
    session: SessionData;
}

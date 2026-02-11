import { Telegraf } from 'telegraf';
import { sessionMiddleware } from './middleware/session.js';
import { env }from '../config/index.js';
import type { BotContext } from '../types/bot.js';
import { de } from 'zod/locales';

if (!env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined');
}

export const  bot = new Telegraf<BotContext>(env.BOT_TOKEN);

// Register custom session middleware
bot.use(sessionMiddleware);

export default bot;

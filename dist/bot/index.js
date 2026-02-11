import { Telegraf } from 'telegraf';
import { sessionMiddleware } from './middleware/session.js';
import { env } from '../config/index.js';
if (!env.BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined');
}
export const bot = new Telegraf(env.BOT_TOKEN);
// Register custom session middleware
bot.use(sessionMiddleware);
//# sourceMappingURL=index.js.map
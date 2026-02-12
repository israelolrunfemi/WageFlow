import { session } from 'telegraf';
import type { BotContext } from '../../types/bot.js';
import type { SessionData } from '../../types/session.js';
import { defaultSession } from '../../config/index.js';

export const sessionMiddleware = session({
  defaultSession: () => ({ ...defaultSession }) as SessionData,
});

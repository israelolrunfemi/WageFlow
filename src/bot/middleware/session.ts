import type { MiddlewareFn } from 'telegraf';
import type { BotContext } from '../../types/bot.js';
import type { SessionData } from '../../types/session.js';
import { defaultSession } from '../../config/index.js';


export const sessionMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  if (!ctx.session) {
    const initialSession: SessionData = {
      ...defaultSession,
    };

    ctx.session = initialSession;
  }

  await next();
};

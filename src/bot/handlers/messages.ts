import type { BotContext } from '../../types/bot.js';
import { wageFlowAIAgent } from '../../services/ai/agent.js';
import { ConversationHandlers } from './conversations.js';

function getRetryDelaySeconds(error: any): string | null {
  const details = error?.errorDetails;
  if (!Array.isArray(details)) return null;

  const retryInfo = details.find((detail: any) => detail?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
  const retryDelay = retryInfo?.retryDelay as string | undefined;
  if (!retryDelay) return null;

  const seconds = Number.parseInt(retryDelay.replace('s', ''), 10);
  return Number.isFinite(seconds) ? String(seconds) : null;
}

export class MessageHandlers {
  // Route text messages to appropriate handler
  static async handleText(ctx: BotContext) {
    const message = ctx.message;
    const text = message && 'text' in message ? message.text : undefined;
    if (!text) return;

    console.log(`📨 Received message: "${text}" | Session state: ${ctx.session.state}`);

    // Ignore commands (they're handled separately)
    if (text.startsWith('/')) return;

    // Handle conversation flow
    if (ctx.session.state && ctx.session.state !== 'idle') {
      return ConversationHandlers.handleText(ctx);
    }

    const telegramId = ctx.from?.id;

    if (telegramId && wageFlowAIAgent.isEnabled()) {
      try {
        await ctx.sendChatAction('typing');
        const aiReply = await wageFlowAIAgent.reply(telegramId, text);

        if (aiReply) {
          await ctx.reply(aiReply);
          return;
        }
      } catch (error: any) {
        console.error('AI response error:', error);

        if (error?.status === 429) {
          const retrySeconds = getRetryDelaySeconds(error);
          await ctx.reply(
            retrySeconds
              ? `⏳ AI is rate-limited right now. Please try again in about ${retrySeconds}s.`
              : '⏳ AI is rate-limited right now. Please try again in a short while.'
          );
          return;
        }

        if (error?.status === 401 || error?.status === 403) {
          await ctx.reply('⚠️ AI is temporarily unavailable due to an API key or billing configuration issue.');
          return;
        }
      }
    }

    // Default response fallback
    await ctx.reply(
      "I'm not sure what you mean. Try these commands:\n\n" +
        '/start - Get started\n' +
        '/add_employee - Add team member\n' +
        '/employees - View team\n' +
        '/pay - Pay everyone\n' +
        '/help - Show help\n\n' +
        'Tip: Add GEMINI_API_KEY in your .env to enable smart AI chat replies.'
    );
  }
}

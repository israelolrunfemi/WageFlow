import type { BotContext } from '../../types/bot.js';
import { wageFlowAIAgent } from '../../services/ai/agent.js';
import { ConversationHandlers } from './conversations.js';

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
      } catch (error) {
        console.error('AI response error:', error);
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

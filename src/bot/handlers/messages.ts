import type { BotContext } from '../../types/bot.js';
import { ConversationHandlers } from './conversations.js';

export class MessageHandlers {
  // Route text messages to appropriate handler
  static async handleText(ctx: BotContext) {
    const text = ctx.message?.text;
    if (!text) return;

    console.log(`📨 Received message: "${text}" | Session state: ${ctx.session.state}`);

    // Ignore commands (they're handled separately)
    if (text.startsWith('/')) return;

    // Handle conversation flow
    if (ctx.session.state && ctx.session.state !== 'idle') {
      return ConversationHandlers.handleText(ctx);
    }

    // Default response for random text
    await ctx.reply(
      "I'm not sure what you mean. Try these commands:\n\n" +
        '/start - Get started\n' +
        '/add_employee - Add team member\n' +
        '/employees - View team\n' +
        '/pay - Pay everyone\n' +
        '/help - Show help'
    );
  }
}
import { Telegraf } from 'telegraf';
import { env } from '../config/env.js';
import { CommandHandlers } from './handlers/commands.js';
import { CallbackHandlers } from './handlers/callbacks.js';
import { MessageHandlers } from './handlers/messages.js';
import { sessionMiddleware } from './middleware/session.js';
import { COMMANDS } from '../config/constants.js';
import type { BotContext } from '../types/bot.js';

export default function createBot() {
  const bot = new Telegraf<BotContext>(env.BOT_TOKEN);

  console.log('Loaded COMMANDS:', COMMANDS);

  // Middleware
  bot.use(sessionMiddleware);

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An error occurred. Please try again.');
  });

  // Commands
  bot.command('start', CommandHandlers.start);
  bot.command('help', CommandHandlers.help);
  bot.command('add_employee', CommandHandlers.addEmployee);
  bot.command('employees', CommandHandlers.listEmployees);
  bot.command('balance', CommandHandlers.checkBalance);
  bot.command('pay', CommandHandlers.pay);
  bot.command('pin', CommandHandlers.setPin);
  bot.command('new_pin', CommandHandlers.changePin);

  // Callbacks (button clicks)
  bot.on('callback_query', CallbackHandlers.handleCallback);

  // Text messages
  bot.on('text', MessageHandlers.handleText);

  return bot;
}
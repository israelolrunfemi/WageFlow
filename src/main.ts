import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase, Company, Employee, Payment } from './services/database/index.js';
import  createBot  from './bot/index.js';

async function main() {
  console.log('🚀 Starting WageFlow Bot...\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Environment:', env.NODE_ENV);
  console.log('Database:', env.DATABASE_URL.split('@')[1]?.split('?')[0] || 'configured');
  console.log('Celo RPC:', env.CELO_RPC_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Connect to database
  await connectDatabase();

  // Check counts
  // const companies = await Company.count();
  // const employees = await Employee.count();
  // const payments = await Payment.count();

  console.log('📊 Database Status:');
  // console.log(`   Companies: ${companies}`);
  // console.log(`   Employees: ${employees}`);
  // console.log(`   Payments: ${payments}\n`);

  // Check bot token
  if (!env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not set in .env file\n');
    console.log('To get a bot token:');
    console.log('1. Message @BotFather on Telegram');
    console.log('2. Send /newbot');
    console.log('3. Copy the token to .env\n');
    process.exit(1);
  }

  // Create and start bot
  console.log('🤖 Starting Telegram Bot...');
  const bot = createBot();

  await bot.launch();
  console.log('✅ Bot started successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 WageFlow Bot is now running!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📱 Open Telegram and message your bot');
  console.log('💡 Send /start to begin\n');
  console.log('Press Ctrl+C to stop\n');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n\n🛑 Received ${signal}, shutting down...`);
    bot.stop(signal);
    await disconnectDatabase();
    console.log('✅ Shutdown complete');
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
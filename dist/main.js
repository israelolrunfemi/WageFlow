import { env } from './config/env.js';
import prisma from './services/database/client.js';
import { createBot } from './bot/index.js';
async function main() {
    console.log('🚀 Starting WageFlow Bot...\n');
    // Display environment info
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Environment:', env.NODE_ENV);
    console.log('Database:', env.DATABASE_URL.split('@')[1]?.split('?')[0] || 'configured');
    console.log('Celo RPC:', env.CELO_RPC_URL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    // Test database connection
    try {
        console.log('📊 Database Status:');
        const companies = await prisma.company.count();
        const employees = await prisma.employee.count();
        const payments = await prisma.payment.count();
        console.log(`   Companies: ${companies}`);
        console.log(`   Employees: ${employees}`);
        console.log(`   Payments: ${payments}`);
        console.log('   ✅ Database connected\n');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
    // Check bot token
    if (!env.BOT_TOKEN) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ BOT_TOKEN not set in .env file');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('To get a bot token:\n');
        console.log('1. Open Telegram and message @BotFather');
        console.log('2. Send: /newbot');
        console.log('3. Choose a name (e.g., "WageFlow Bot")');
        console.log('4. Choose a username (e.g., "wageflow_payroll_bot")');
        console.log('5. Copy the token you receive');
        console.log('6. Add to your .env file:\n');
        console.log('   BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11\n');
        process.exit(1);
    }
    // Create and start bot
    console.log('🤖 Starting Telegram Bot...');
    const bot = createBot();
    // Launch bot
    try {
        await bot.launch();
        console.log('✅ Bot started successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 WageFlow Bot is now running!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📱 Open Telegram and message your bot');
        console.log('💡 Send /start to begin\n');
        console.log('Press Ctrl+C to stop the bot\n');
    }
    catch (error) {
        console.error('❌ Failed to start bot:', error);
        console.log('\nPossible issues:');
        console.log('1. Invalid BOT_TOKEN');
        console.log('2. Bot token already in use');
        console.log('3. Network connection issues\n');
        process.exit(1);
    }
    // Graceful shutdown handlers
    const shutdown = async (signal) => {
        console.log(`\n\n🛑 Received ${signal}, shutting down gracefully...`);
        try {
            console.log('Stopping bot...');
            bot.stop(signal);
            console.log('Closing database connection...');
            await prisma.$disconnect();
            console.log('✅ Shutdown complete');
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };
    // Register shutdown handlers
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
    // Handle uncaught errors
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        shutdown('uncaughtException');
    });
}
// Start the application
main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
import { Sequelize } from 'sequelize';
import { env } from '../../config/env.js';

// Parse DATABASE_URL
const databaseUrl = env.DATABASE_URL;

// Create Sequelize instance
export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test connection
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: env.NODE_ENV === 'development' });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await sequelize.close();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}
import { Sequelize } from 'sequelize';
import { env } from '../../config/env.js';
import { initCompany } from './models/Company.js';
import { initEmployee } from './models/Employee.js';
import { initPayment } from './models/Payment.js';

// Create Sequelize instance with models
export const sequelize = new Sequelize(env.DATABASE_URL);

// Initialize models
export const Company = initCompany(sequelize);
export const Employee = initEmployee(sequelize);
export const Payment = initPayment(sequelize);

// Set up associations
Company.hasMany(Employee, { foreignKey: 'company_id', as: 'employees' });
Employee.belongsTo(Company, { foreignKey: 'company_id' });

Company.hasMany(Payment, { foreignKey: 'company_id', as: 'payments' });
Payment.belongsTo(Company, { foreignKey: 'company_id' });

Employee.hasMany(Payment, { foreignKey: 'employee_id', as: 'payments' });
Payment.belongsTo(Employee, { foreignKey: 'employee_id' });

// Database functions
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync({ alter: env.NODE_ENV === 'development' });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await sequelize.close();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}
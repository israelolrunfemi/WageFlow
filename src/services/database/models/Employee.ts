import { Model, DataTypes } from 'sequelize';
import type { Sequelize } from 'sequelize';

export class Employee extends Model {
  declare id: number;
  declare companyId: number;
  declare name: string;
  declare walletAddress: string;
  declare telegramId: bigint | null;
  declare salaryAmount: number;
  declare preferredCurrency: string;
  declare status: string;
  declare createdAt: Date;

  // Associations
  declare company?: any;
  declare payments?: any[];
}

export function initEmployee(sequelize: Sequelize) {
  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'company_id',
        references: {
          model: 'companies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      walletAddress: {
        type: DataTypes.STRING(42),
        allowNull: false,
        field: 'wallet_address',
      },
      telegramId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'telegram_id',
      },
      salaryAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'salary_amount',
      },
      preferredCurrency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'cUSD',
        field: 'preferred_currency',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      sequelize,
      tableName: 'employees',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          fields: ['company_id'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  return Employee;
}
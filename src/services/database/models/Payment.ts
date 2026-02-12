import { Model, DataTypes } from 'sequelize';
import type { Sequelize } from 'sequelize';

export class Payment extends Model {
  declare id: number;
  declare companyId: number;
  declare employeeId: number;
  declare amount: number;
  declare currency: string;
  declare txHash: string;
  declare status: string;
  declare createdAt: Date;

  // Associations
  declare company?: any;
  declare employee?: any;
}

export function initPayment(sequelize: Sequelize) {
  Payment.init(
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
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'employee_id',
        references: {
          model: 'employees',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      txHash: {
        type: DataTypes.STRING(66),
        allowNull: false,
        field: 'tx_hash',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
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
      tableName: 'payments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          fields: ['company_id'],
        },
        {
          fields: ['employee_id'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  return Payment;
}
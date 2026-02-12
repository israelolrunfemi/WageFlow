import { Model, DataTypes } from 'sequelize';
import type { Sequelize } from 'sequelize';

export class Company extends Model {
  declare id: number;
  declare telegramId: bigint;
  declare name: string;
  declare walletAddress: string | null;
  declare createdAt: Date;

  // Associations
  declare employees?: any[];
  declare payments?: any[];
}

export function initCompany(sequelize: Sequelize) {
  Company.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      telegramId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        field: 'telegram_id',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      walletAddress: {
        type: DataTypes.STRING(42),
        allowNull: true,
        field: 'wallet_address',
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
      tableName: 'companies',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return Company;
}
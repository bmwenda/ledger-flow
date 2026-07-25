import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize
} from "sequelize";
import type { User } from "./User.ts";
import type { Transaction } from "./Transaction.ts";

export class Account extends Model<InferAttributes<Account, { omit:  "createdAt" | "updatedAt" }>, InferCreationAttributes<Account, { omit:  "createdAt" | "updatedAt"}>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare currency: string;
  declare balance: CreationOptional<string>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<User>;
  declare sentTransactions?: NonAttribute<Transaction[]>;
  declare receivedTransactions?: NonAttribute<Transaction[]>;
}

export function initAccount(sequelize: Sequelize): void {
  Account.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // user has one account
      references: { model: "users", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: { notEmpty: true }
    },
    balance: {
      type: DataTypes.DECIMAL(20, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: { isNumeric: true, notEmpty: true }
    }
  },
  { sequelize, underscored: true });
}

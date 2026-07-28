import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize
} from "sequelize";
import type { Account } from "./Account.ts";

export const TRANSACTION_STATUSES = ["pending", "completed", "cancelled", "failed"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];


export class Transaction extends Model<InferAttributes<Transaction, { omit:  "createdAt" | "updatedAt" }>, InferCreationAttributes<Transaction, { omit:  "createdAt" | "updatedAt"}>> {
  declare id: CreationOptional<string>;
  declare amount: string; // pg-node returns decimal as string
  declare fromAccountId: string;
  declare toAccountId: string;
  declare idempotencyKey: string;
  declare status: CreationOptional<TransactionStatus>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare fromAccount?: NonAttribute<Account>;
  declare toAccount?: NonAttribute<Account>
}

export function initTransaction(sequelize: Sequelize): void {
  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DECIMAL(20, 4),
      allowNull: false,
      validate: { isNumeric: true }
    },
    fromAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "accounts", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    toAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "accounts", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    idempotencyKey: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM(...TRANSACTION_STATUSES),
      allowNull: false,
      defaultValue: "pending"
    }
  },
  {
    sequelize,
    underscored: true,
    indexes: [
      { fields: ["from_account_id"] },
      { fields: ["to_account_id"] },
      { fields: ["created_at"] }
    ]
  });
}

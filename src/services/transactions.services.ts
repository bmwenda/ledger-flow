import { Transaction } from "../models/Transaction.ts";
import type { InferCreationAttributes } from "sequelize";
import { Op } from "sequelize";
import { TransactionNotFoundError } from "../errors/domain-errors.ts";
import { assertTransactionParams } from "../validators/transactions.validator.ts";

export type CreateTransactionInput = Pick<
  InferCreationAttributes<Transaction>,
  "fromAccountId" | "toAccountId" | "amount"
>;

export async function getTransactionById(id: string): Promise<Transaction> {
  const transaction = await Transaction.findByPk(id);

  if (!transaction) {
    throw new TransactionNotFoundError(id);
  }

  return transaction;
}

export async function getTransactionsByAccountId(id: string): Promise<Transaction[]> {
  const transactions = await Transaction.findAll({
    where: {
      [Op.or]: [{ fromAccountId: id }, { toAccountId: id }]
    },
    order: [ ["createdAt", "DESC"]]
  });

  return transactions;
}

export async function createTransactionToDb(transaction: CreateTransactionInput): Promise<Transaction> {
  // TODO: Error checks: 2. toAccountId not exists, 3. fromAccountId not exists
  assertTransactionParams(transaction);
  // TODO: implement locks and wrap in transaction
  const result = await Transaction.create(transaction);
  return result;
}

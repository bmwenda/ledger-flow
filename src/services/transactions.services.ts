import { Transaction } from "../models/Transaction.ts";
import { Op } from "sequelize";

class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`Transaction not found: ${id}`);
    this.name = "TransactionNotFoundError";
  }
}

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


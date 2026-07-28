import { Decimal } from "decimal.js";
import { Op } from "sequelize";
import { sequelize } from "../db.ts";
import type { InferCreationAttributes } from "sequelize";
import { Account } from "../models/Account.ts";
import { Transaction } from "../models/Transaction.ts";
import { AccountNotFoundError, InvalidTransferError, TransactionNotFoundError } from "../errors/domain-errors.ts";
import { assertTransactionParams } from "../validators/transactions.validator.ts";

export type CreateTransactionInput = Pick<
  InferCreationAttributes<Transaction>,
  "fromAccountId" | "toAccountId" | "amount" | "idempotencyKey"
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
  assertTransactionParams(transaction);

  // Check if replay
  const existing = await Transaction.findOne({ where: { idempotencyKey: transaction.idempotencyKey } });
  if (existing) return existing;

  return await sequelize.transaction(async t => {
    // Deterministic picking of IDs to prevent dead locks
    const [firstId, secondId] = [transaction.fromAccountId, transaction.toAccountId].sort();

    const firstAccount = await Account.findByPk(firstId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    }); // lock row with SELECT ... FOR UPDATE
    const secondAccount = await Account.findByPk(secondId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    }); // lock row with SELECT ... FOR UPDATE

    if(!firstAccount) throw new AccountNotFoundError(firstId);
    if(!secondAccount) throw new AccountNotFoundError(secondId);

    const fromAccount = transaction.fromAccountId == firstId ? firstAccount : secondAccount;
    const toAccount = transaction.fromAccountId == firstId ? secondAccount : firstAccount;

    if (new Decimal(fromAccount.balance).lt(transaction.amount)) { // balance in lock until after entire transaction
      throw new InvalidTransferError("Insufficient balance");
    }

    const transferAmount = new Decimal(transaction.amount).toFixed(4);

    const result = await Transaction.create(
      { ...transaction, amount: transferAmount },
      { transaction: t }
    );
    await Account.update(
      {
        balance: new Decimal(fromAccount.balance).minus(transferAmount).toFixed(4)
      },
      { where: { id: transaction.fromAccountId }, transaction: t },
    );
    await Account.update(
      {
        balance: new Decimal(toAccount.balance).plus(transferAmount).toFixed(4)
      },
      { where: { id: transaction.toAccountId }, transaction: t }
    );
    return result;
  });
}

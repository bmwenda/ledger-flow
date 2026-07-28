import { sequelize } from "../db.ts";
import { initModels } from "../models/index.ts";
import { User } from "../models/User.ts";
import { Account } from "../models/Account.ts";
import { Transaction } from "../models/Transaction.ts";
import { Decimal } from "decimal.js";
import { createTransactionToDb, type CreateTransactionInput } from "../services/transactions.services.ts";
import { AccountNotFoundError, InvalidTransferError } from "../errors/domain-errors.ts";

// Naive baseline — no lock, no ordering
async function createTransactionToDbNaive(transaction: CreateTransactionInput) {
  return await sequelize.transaction(async t => {
    const fromAccount = await Account.findByPk(transaction.fromAccountId, { transaction: t });
    const toAccount = await Account.findByPk(transaction.toAccountId, { transaction: t });

    if (!fromAccount) throw new AccountNotFoundError(transaction.fromAccountId);
    if (!toAccount) throw new AccountNotFoundError(transaction.toAccountId);

    if (new Decimal(fromAccount.balance).lt(transaction.amount)) {
      throw new InvalidTransferError('Insufficient balance');
    }

    const transferAmount = new Decimal(transaction.amount).toFixed(4);

    const result = await Transaction.create(
      { ...transaction, amount: transferAmount },
      { transaction: t }
    );
    await Account.update(
      { balance: new Decimal(fromAccount.balance).minus(transferAmount).toFixed(4) },
      { where: { id: transaction.fromAccountId }, transaction: t }
    );
    await Account.update(
      { balance: new Decimal(toAccount.balance).plus(transferAmount).toFixed(4) },
      { where: { id: transaction.toAccountId }, transaction: t }
    );
    return result;
  });
}

describe('createTransactionToDb concurrency', () => {
  let accountA: Account;
  let accountB: Account;

  beforeAll(() => {
    initModels(sequelize);
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const userA = await User.create({ firstName: 'Alice', email: 'alice@example.com' });
    const userB = await User.create({ firstName: 'Bob', email: 'bob@example.com' });

    accountA = await Account.create({ userId: userA.id, currency: 'USD', balance: '1000.0000' });
    accountB = await Account.create({ userId: userB.id, currency: 'USD', balance: '1000.0000' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('optimized version: concurrent transfers preserve total balance', async () => {
    const TRANSFER_COUNT = 50;
    const TRANSFER_AMOUNT = '10.0000';

    // 50 concurrent transfers A -> B
    const transfers = Array.from({ length: TRANSFER_COUNT }, () =>
      createTransactionToDb({
        fromAccountId: accountA.id,
        toAccountId: accountB.id,
        amount: TRANSFER_AMOUNT,
      })
    );

    await Promise.all(transfers);

    const refreshedA = await Account.findByPk(accountA.id);
    const refreshedB = await Account.findByPk(accountB.id);

    const expectedA = new Decimal(1000).minus(new Decimal(TRANSFER_AMOUNT).times(TRANSFER_COUNT));
    const expectedB = new Decimal(1000).plus(new Decimal(TRANSFER_AMOUNT).times(TRANSFER_COUNT));

    expect(new Decimal(refreshedA!.balance).toFixed(4)).toBe(expectedA.toFixed(4));
    expect(new Decimal(refreshedB!.balance).toFixed(4)).toBe(expectedB.toFixed(4));

    // Total balance conserved — nothing created or destroyed
    const total = new Decimal(refreshedA!.balance).plus(refreshedB!.balance);
    expect(total.toFixed(4)).toBe('2000.0000');
  });

  test('naive version: concurrent transfers lose updates (race condition)', async () => {
    const TRANSFER_COUNT = 200; // A high enough number to trigger race condition
    const TRANSFER_AMOUNT = '10.0000';

    const transfers = Array.from({ length: TRANSFER_COUNT }, () =>
      createTransactionToDbNaive({
        fromAccountId: accountA.id,
        toAccountId: accountB.id,
        amount: TRANSFER_AMOUNT,
      })
    );

    await Promise.all(transfers);

    const refreshedA = await Account.findByPk(accountA.id);
    const refreshedB = await Account.findByPk(accountB.id);

    const expectedA = new Decimal(1000).minus(new Decimal(TRANSFER_AMOUNT).times(TRANSFER_COUNT));
    const expectedB = new Decimal(1000).plus(new Decimal(TRANSFER_AMOUNT).times(TRANSFER_COUNT));

    // Lost updates mean actual balance != expected balance.
    const total = new Decimal(refreshedA!.balance).plus(refreshedB!.balance);

    console.log('Expected A:', expectedA.toFixed(4), 'Actual A:', refreshedA!.balance);
    console.log('Expected B:', expectedB.toFixed(4), 'Actual B:', refreshedB!.balance);
    console.log('Total (should be 2000.0000):', 'Actual total: ', total.toFixed(4));

    expect(total.toFixed(4)).not.toBe('2000.0000'); // asserting the bug exists
  });

  test('optimized version: bidirectional concurrent transfers do not deadlock', async () => {
    const ROUNDS = 30;
    const AMOUNT = '5.0000';

    // A->B and B->A firing simultaneously and repeatedly
    const aToB = Array.from({ length: ROUNDS }, () =>
      createTransactionToDb({ fromAccountId: accountA.id, toAccountId: accountB.id, amount: AMOUNT })
    );
    const bToA = Array.from({ length: ROUNDS }, () =>
      createTransactionToDb({ fromAccountId: accountB.id, toAccountId: accountA.id, amount: AMOUNT })
    );

    // If lock ordering is broken, this will hang or reject with deadlock_detected
    await expect(Promise.all([...aToB, ...bToA])).resolves.toBeDefined();

    const refreshedA = await Account.findByPk(accountA.id);
    const refreshedB = await Account.findByPk(accountB.id);

    // Equal rounds each direction at equal amounts should net to original balances
    expect(new Decimal(refreshedA!.balance).toFixed(4)).toBe('1000.0000');
    expect(new Decimal(refreshedB!.balance).toFixed(4)).toBe('1000.0000');
  });
});

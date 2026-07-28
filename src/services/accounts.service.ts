import { Account } from "../models/Account.ts";
import { AccountNotFoundError } from "../errors/domain-errors.ts";

export async function getAccountById(id: string): Promise<Account> {
  const account = await Account.findByPk(id);

  if (!account) {
    throw new AccountNotFoundError(id);
  }

  return account;
};

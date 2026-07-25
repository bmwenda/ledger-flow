import { Account } from "../models/Account.ts";

export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`Account not found: ${id}`);
    this.name = "AccountNotFoundError";
  }
}

export async function getAccountById(id: string): Promise<Account> {
  const account = await Account.findByPk(id);

  if (!account) {
    throw new AccountNotFoundError(id);
  }

  return account;
};

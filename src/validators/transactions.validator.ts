import { Decimal } from "decimal.js"
import { InvalidTransferError } from "../errors/domain-errors.ts";

interface TransactionParams {
  toAccountId: string,
  fromAccountId: string,
  amount: string
}

export function assertTransactionParams(params: TransactionParams): void {
  if (params.toAccountId == params.fromAccountId) {
    throw new InvalidTransferError("Cannot send to self");
  }

  if (new Decimal(params.amount).lte(0)) {
    throw new InvalidTransferError("Amount must be positive");
  }
}

export abstract class DomainError extends Error {
  abstract statusCode: number
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends DomainError {
  statusCode = 400;
}

export class AccountNotFoundError extends DomainError {
  statusCode = 404;
  constructor(id: string) {
    super(`Account not found: ${id}`);
    this.name = "AccountNotFoundError";
  }
}

export class TransactionNotFoundError extends DomainError {
  statusCode = 404;
  constructor(id: string) {
    super(`Transaction not found: ${id}`);
    this.name = "TransactionNotFoundError";
  }
}

export class InvalidTransferError extends DomainError {
  statusCode = 422;
}

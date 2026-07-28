import { z } from "zod";
import { type NextFunction, type Request, type Response } from "express";
import { getAccountById } from "../services/accounts.service.ts";
import { getTransactionsByAccountId } from "../services/transactions.services.ts";
import { BadRequestError } from "../errors/domain-errors.ts";

const accountParamsSchema = z.object({
  id: z.uuidv4()
});

const transactionParamsSchema = z.object({
  id: z.uuidv4()
});

export async function getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsedParams = accountParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new BadRequestError("Invalid Id format");
  }

  try {
    const account = await getAccountById(parsedParams.data.id);

    res.json(account);
  } catch(err) {
    next(err);
  };
}

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>  {
  const parsedParams = transactionParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new BadRequestError("Invalid id format");
  }

  try {
    const transactions = await getTransactionsByAccountId(parsedParams.data.id);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

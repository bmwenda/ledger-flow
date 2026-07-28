import { z } from "zod";
import { type NextFunction, type Request, type Response } from "express";
import { AccountNotFoundError, getAccountById } from "../services/accounts.service.ts";
import { getTransactionsByAccountId } from "../services/transactions.services.ts";

const accountParamsSchema = z.object({
  id: z.uuidv4()
});

const transactionParamsSchema = z.object({
  id: z.uuidv4()
});

export async function getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsedParams = accountParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid account id" });
    return;
  }

  try {
    const account = await getAccountById(parsedParams.data.id);

    res.json(account);
  } catch(err) {
    if (err instanceof AccountNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  };
}

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>  {
  const parsedParams = transactionParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid transaction id" });
    return;
  }

  try {
    const transactions = await getTransactionsByAccountId(parsedParams.data.id);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { createTransactionToDb } from "../services/transactions.services.ts";
import { BadRequestError } from "../errors/domain-errors.ts";

const transactionParams = z.object({
  toAccountId: z.uuidv4(),
  fromAccountId: z.uuidv4(),
  amount: z.number()
})

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = transactionParams.safeParse(req.body);
  console.log(parsed)

  if (!parsed.success) {
    throw new BadRequestError("Invalid body format");
  }

  try {
    const transaction = await createTransactionToDb({
      ...parsed.data,
      amount: parsed.data.amount.toString()
    });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

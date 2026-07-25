import { z } from "zod";
import { type NextFunction, type Request, type Response } from "express";
import { AccountNotFoundError, getAccountById } from "../services/accounts.service.ts";

const accountParamsSchema = z.object({
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

export async function getTransactions(req: Request, res: Response): Promise<void>  {
  res.json({"id": 1, to_account: "3", from_account: "4"});
}

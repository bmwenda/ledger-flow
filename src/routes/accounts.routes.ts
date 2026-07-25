import { Router } from "express";
import { getAccount, getTransactions } from "../controllers/accounts.controller.ts";

const accountsRouter = Router();

accountsRouter.get("/:id", getAccount);
accountsRouter.get("/:id/transactions", getTransactions);

export default accountsRouter;

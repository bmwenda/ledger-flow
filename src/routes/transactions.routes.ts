import { Router } from "express";
import { createTransaction } from "../controllers/transactions.controller.ts";

const transactionRouter = Router();

transactionRouter.post("/", createTransaction);

export default transactionRouter;

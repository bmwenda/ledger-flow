import express, { type Express, type Request, type Response  } from "express";
import accountsRouter from "./routes/accounts.routes.ts";
import transactionRouter from "./routes/transactions.routes.ts";
import { errorHandler } from "./middleware/error-handler.ts";

const app: Express = express();

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/accounts", accountsRouter);
app.use("/transactions", transactionRouter);

app.use(errorHandler);

export default app;

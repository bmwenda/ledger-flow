import express, { type Express, type Request, type Response  } from "express";
import accountsRouter from "./routes/accounts.routes.ts";

const app: Express = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/accounts", accountsRouter);

export default app;

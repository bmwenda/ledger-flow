import express, { type Express, type Request, type Response  } from "express";
import { sequelize } from "./db.ts";
import { initModels } from "./models/index.ts";

const PORT = 3000;

const app: Express = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

async function start(): Promise<void> {
  // Schema is owned by migrations now (npm run db:migrate), not sequelize.sync().
  initModels(sequelize);
  await sequelize.authenticate();
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start().catch((err: unknown) => {
  console.log("Server failed to start\n", err);
  process.exit(1);
});

import app from "./app.ts";
import { sequelize } from "./db.ts";
import { initModels } from "./models/index.ts";

const PORT = 3000;

async function start(): Promise<void> {
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

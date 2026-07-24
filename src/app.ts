import express, { type Express, type Response  } from "express";

const PORT = 3000;

const app: Express = express();

app.get("/", (_, res: Response) => {
  res.send("Hello World!");
});

app.listen(PORT);

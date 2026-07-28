import { type ErrorRequestHandler } from "express";
import { DomainError } from "../errors/domain-errors.ts";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "A server error occurred" });
};

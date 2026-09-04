import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error:", err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  const isOperational = err instanceof AppError || err.isOperational === true;

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for ${err.path || "field"}`;
  } else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field || "Field"} already exists`;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (!isOperational) {
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

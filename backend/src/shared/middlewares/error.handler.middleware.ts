import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";
import {
  isMongooseCastError,
  isMongoDuplicateError,
  isJwtError } from '../errors/error.gaurds.js';
  
  
  export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error:", err);

  // 1. Application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 2. Mongoose CastError
  if (isMongooseCastError(err)) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: `Invalid format for ${err.path ?? "field"}`,
    });
  }




  // 4. Mongo duplicate key
  if (isMongoDuplicateError(err)) {
    const field = Object.keys(err.keyValue ?? {})[0];

    return res.status(HttpStatus.CONFLICT).json({
      success: false,
      message: `${field ?? "Field"} already exists`,
    });
  }

  // 5. JWT error
  if (isJwtError(err)) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // 6. Generic Error
  if (err instanceof Error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  // 7. Completely unknown value
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
};
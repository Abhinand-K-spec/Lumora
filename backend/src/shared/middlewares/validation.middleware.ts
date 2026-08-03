import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((err) => err.message)
        .join(", ");

      return next(new AppError(HttpStatus.BAD_REQUEST, errorMessages));
    }

    req.body = result.data;
    next();
  };
};

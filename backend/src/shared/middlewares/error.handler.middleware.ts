import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";





export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    const statusCode = err.statusCode || 500;

    const message = err instanceof AppError || err.isOperational ? err.message : 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message
    })

}



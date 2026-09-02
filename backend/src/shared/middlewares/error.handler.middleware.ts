import type{ Request, Response, NextFunction } from "express";





export const errorHandler = async(err:any, req:Request,res:Response,next:NextFunction)=>{
    console.log(err);

    const statusCode = err.statusCode || 500;

    const message = err.isOperational?err.message : 'Internal server error';

    res.status(statusCode).json({
        success:false,
        message
    })
    
}



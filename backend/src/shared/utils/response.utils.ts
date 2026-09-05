import type { ApiResponse } from "../types/api.response.type"
import type { Response } from "express";




export const sendSuccess = <T>(res:Response,data:T,message:string,statusCode:number=200):void=>{
    const response:ApiResponse<T> = {
        success :true,
        message,
        data
    };

    res.status(statusCode).json(response);
};
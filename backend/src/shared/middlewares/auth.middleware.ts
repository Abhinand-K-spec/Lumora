import type { Response,Request,NextFunction } from "express";
import { TokenService } from "../../modules/user/auth/services/TokenService.js";
import { AppError } from "../errors/AppError.js";


const tokenService = new TokenService();

export const authenticate = (req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.cookies.accessToken;

        if(!token){
            throw new AppError(401,'Not authorized')
        }

        const decoded = tokenService.verifyAccessToken(token);

        req.user = decoded;

        next();

    } catch (error) {
        next(new AppError(401,'Invalid or expired token'));
    }
}
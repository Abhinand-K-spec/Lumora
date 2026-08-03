import type { Response,Request,NextFunction } from "express";
import { TokenService } from "../../modules/user/auth/services/TokenService.js";
import { AppError } from "../errors/AppError.js";
import User from "../models/user.model.js";
import { accountStatus } from "../enums/accountStatus.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../constants/message.constant.js";


const tokenService = new TokenService();

export const authenticate = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.cookies.accessToken;

        if(!token){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED)
        }

        const decoded = tokenService.verifyAccessToken(token);

        req.user = decoded;
        const user = await User.findById(req.user.id);

        if (!user) {
            throw new AppError(
                HttpStatus.UNAUTHORIZED,
                AUTH_MESSAGES.USER_NOT_FOUND
            );
        };

       if(user.accountStatus!==accountStatus.Active){
            throw new AppError(
                HttpStatus.FORBIDDEN,
                AUTH_MESSAGES.SUSPENDED
            );
       }
        


        next();

    } catch (error) {
        next(error);
    }
}
import type {Request, Response, NextFunction} from 'express';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';
import type { LoginUserDto } from '../dto/LoginUserDto.js';


export class AuthController{
    constructor(
        private readonly authService : IAuthService
    ){}

    
    async register(req:Request, res:Response, next:NextFunction):Promise<void>{
        try {
            const data:RegisterUserDto = req.body;

            const response = await this.authService.register(data);


            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data:response
            })
        } catch (error) {
            next(error);
        }
    }



    async login(req:Request,res:Response, next:NextFunction):Promise<void>{
        try {
            const data:LoginUserDto = req.body;

            const response = await this.authService.login(data);


            res.cookie("accessToken", response.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success:true,
                message:'Successfully logged in',
                data:{
                    user:response.user
                }
            });

        } catch (error) {
            next(error);
        }
    }


    

}
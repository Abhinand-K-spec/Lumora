import type {Request, Response, NextFunction} from 'express';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';
import type { LoginUserDto } from '../dto/LoginUserDto.js';
import { AuthService } from '../services/AuthService.js';
import { AppError } from '../../../shared/errors/AppError.js';


export class AuthController{
    constructor(
        private readonly _authService : IAuthService
    ){}

    
    async register(req:Request, res:Response, next:NextFunction):Promise<void>{
        try {
            const data:RegisterUserDto = req.body;

            const response = await this._authService.register(data);


            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data:response
            })
        } catch (error) {
            next(error);
        }
    }



    async refresh(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {

            const refreshToken = req.cookies.refreshToken;

            if(!refreshToken){
                throw new AppError(401,'Refresh token is missing');
            }

            
            const accessToken = await this._authService.refresh(refreshToken);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: "Access token refreshed successfully",
            });

            
        }catch(error) {
                next(error);
        }
    }


    async login(req:Request,res:Response, next:NextFunction):Promise<void>{
        try {
            const data:LoginUserDto = req.body;

            const response = await this._authService.login(data);


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



    async verifyEmail(req: Request,res: Response) {
        await this._authService.verifyEmail(req.body);
    
        res.status(200).json({
            success: true,
            message: "Email verified successfully."
        });
    }


    async resendOtp(req: Request,res: Response) {
        await this._authService.resendOtp(req.body);
    
        res.status(200).json({
            success: true,
            message: "OTP sent successfully."
        });
    }
    

    async forgotPassword(req:Request,res:Response){

        await this._authService.forgotPassword(req.body);
    
        res.status(200).json({
            success:true,
            message:"Password reset OTP sent successfully."
        });
    }


    async resetPassword(
        req: Request,
        res: Response
    ) {
        await this._authService.resetPassword(req.body);
    
        res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });
    }

}
import type {Request, Response, NextFunction} from 'express';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';


export class AuthController{
    constructor(
        private readonly authService : IAuthService
    ){}

    async register(req:Request, res:Response, next:NextFunction):Promise<void>{
        try {
            const data:RegisterUserDto = req.body;

            await this.authService.register(data);

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            })
        } catch (error) {
            next(error);
        }
    }
}
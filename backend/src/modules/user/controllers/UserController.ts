import type { Request, Response, NextFunction } from "express";
import type { IUserService } from "../interfaces/IUserService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { success } from "zod";

export class UserController {
    constructor(
        private readonly _userService: IUserService
    ) {}



    async getProfile(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                });
                return;
            }


            const user = await this._userService.getProfile(userId);

            res.status(HttpStatus.OK).json({
                success:true,
                message:AUTH_MESSAGES.CURRENT_USER_FETCHED,
                data:{
                    user
                }
            })
        } catch (error) {
            next(error);
        }
    }



    async editProfile(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            
            const userId = req.user?.id;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                });
                return;
            }
            
            const updatedUser = await this._userService.editProfile(userId,req.body);

            res.status(HttpStatus.CREATED).json({
                success:true,
                message:AUTH_MESSAGES.PROFILE_UPDATED,
                data:{
                    user:updatedUser
                }
            })
        } catch (error) {
            next(error);
        }
    }


    async uploadProfilePhoto(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            }

            const updatedUser = await this._userService.editProfile(userId,{profilePhoto:req.body.profilePhoto});

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Photo uploaded successfully',
                data:{
                    photoUrl:updatedUser.profilePhoto
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

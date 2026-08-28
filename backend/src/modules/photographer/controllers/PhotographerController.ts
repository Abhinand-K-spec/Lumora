
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { IPhotographerService } from "../interfaces/IPhotographerService";
import type { Request, Response, NextFunction } from "express";




export class PhotographerController{
    constructor(
        private readonly _photographerService:IPhotographerService
    ){}

    async getProfile(req:Request,res:Response,next:NextFunction):Promise<void>{
    try {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }

        const photographer = await this._photographerService.getProfile(userId);
        console.log('photographer : ',photographer);
        

        res.status(HttpStatus.OK).json({
            success:true,
            message:'Profile fetched successfully',
            data:{photographer:photographer}
        })
    }
     catch (error) {
        next(error);
    }
}


    async editProfile(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            
            const userId = req.user?.id;

            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);

            }

            const photographer = await this._photographerService.editProfile(userId,req.body);


            res.status(HttpStatus.OK).json({
                success:true,
                message:AUTH_MESSAGES.PROFILE_UPDATED,
                data:{photographer:photographer}
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

            const updatedProfile = await this._photographerService.editProfile(userId,{profilePhoto:req.body.profilePhoto});

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Photo uploaded successfully',
                data:{
                    photoUrl:updatedProfile.profilePhoto
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
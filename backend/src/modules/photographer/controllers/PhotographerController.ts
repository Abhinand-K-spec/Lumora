
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

    async getPhotographerById(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const { userId } = req.params;
            if(!userId){
                throw new AppError(HttpStatus.BAD_REQUEST,'User ID is required');
            }

            const photographer = await this._photographerService.getProfile(userId);

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Profile fetched successfully',
                data:{photographer}
            });
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

    async getPhotographers(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const { search, district, service, price } = req.query;

            const photographers = await this._photographerService.getPhotographers({
                search: search ? String(search) : undefined,
                district: district ? String(district) : undefined,
                service: service ? String(service) : undefined,
                price: price ? String(price) : undefined
            });

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Photographers fetched successfully',
                data:{
                    photographers
                }
            });
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

    async uploadCoverPhoto(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            }

            const updatedProfile = await this._photographerService.editProfile(userId,{coverPhoto:req.body.profilePhoto});

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Cover photo uploaded successfully',
                data:{
                    coverPhotoUrl:updatedProfile.coverPhoto
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async addPackage(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            }

            const {
                packageName,
                price,
                description,
                framesIncluded,
                droneIncluded,
                albumIncluded,
                videographersIncluded,
                status
            } = req.body;

            if (!packageName || price === undefined || !description) {
                throw new AppError(HttpStatus.BAD_REQUEST, 'Missing package details');
            }

            const updatedProfile = await this._photographerService.addPackage(userId, {
                packageName,
                price: Number(price),
                description,
                framesIncluded: Boolean(framesIncluded),
                droneIncluded: Boolean(droneIncluded),
                albumIncluded: Boolean(albumIncluded),
                videographersIncluded: Boolean(videographersIncluded),
                status: status || 'active'
            });

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Package added successfully',
                data:{
                    photographer: updatedProfile
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async editPackage(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            }

            const { packageId } = req.params;
            const {
                packageName,
                price,
                description,
                framesIncluded,
                droneIncluded,
                albumIncluded,
                videographersIncluded,
                status
            } = req.body;

            if (!packageId || !packageName || price === undefined || !description) {
                throw new AppError(HttpStatus.BAD_REQUEST, 'Missing package details');
            }

            const updatedProfile = await this._photographerService.editPackage(userId, packageId as string, {
                packageName,
                price: Number(price),
                description,
                framesIncluded: Boolean(framesIncluded),
                droneIncluded: Boolean(droneIncluded),
                albumIncluded: Boolean(albumIncluded),
                videographersIncluded: Boolean(videographersIncluded),
                status: status || 'active'
            });

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Package updated successfully',
                data:{
                    photographer: updatedProfile
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePackage(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id;
            if(!userId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            }

            const { packageId } = req.params;
            if (!packageId) {
                throw new AppError(HttpStatus.BAD_REQUEST, 'Missing package ID');
            }

            const updatedProfile = await this._photographerService.deletePackage(userId, packageId as string);

            res.status(HttpStatus.OK).json({
                success:true,
                message:'Package deleted successfully',
                data:{
                    photographer: updatedProfile
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
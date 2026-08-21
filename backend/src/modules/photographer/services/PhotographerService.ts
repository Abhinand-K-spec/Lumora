import { AUTH_MESSAGES } from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { IPhotographer } from "../../../shared/interfaces/IPhotographer";
import type { IUserRepository } from "../../auth/interfaces/IUserRepository"
import type { editPhotographerProfileDto } from "../dto/editPhotographerProfileDto";
import { photographerProfileMapper } from "../dto/photographerProfileMapper";
import type { photographerProfileResponseDto } from "../dto/photographerProfileResponseDto"
import type { IPhotographerService } from "../interfaces/IPhotographerService"
import type { IPhotographerRepository } from "../repositories/IPhotographerRepository"


export class PhotographerService implements IPhotographerService{
    constructor(
        private readonly _userRepository:IUserRepository,
        private readonly _photographerRepository:IPhotographerRepository
    ){}


    async getProfile(userId: string): Promise<photographerProfileResponseDto> {
        const user = await this._userRepository.findById(userId);
        if(!user){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }

        const profile = await this._photographerRepository.findByUserId(userId);

        if(!profile){
            throw new AppError(HttpStatus.BAD_REQUEST,'No profile found');
        }

        return photographerProfileMapper.toProfileResponse(user,profile);
    }


    async editProfile(userId: string, data: editPhotographerProfileDto): Promise<photographerProfileResponseDto> {
        let user = await this._userRepository.findById(userId);
        if(!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }

        if(data.name !== undefined){
            user = await this._userRepository.update(userId,{name:data.name});
        }

        let profile = await this._photographerRepository.findByUserId(userId);

        if(!profile){
            profile = await this._photographerRepository.create({
                userId,
                bio: data.bio || "",
                phone: data.phone || "",
                profilePhoto: data.profilePhoto || ""
            });
        }else{
            const profileData: Partial<IPhotographer> = {};

            if(data.bio!==undefined) profileData.bio = data.bio;
            if(data.phone!==undefined) profileData.phone = data.phone;
            if(data.profilePhoto!== undefined) profileData.profilePhoto = data.profilePhoto;

            profile = await this._photographerRepository.update(profile._id.toString(),profileData);
        }
        return photographerProfileMapper.toProfileResponse(user!,profile!);
    }

}
import type { editPhotographerProfileDto } from "../dto/editPhotographerProfileDto";
import type { photographerProfileResponseDto } from "../dto/photographerProfileResponseDto";

export interface IPhotographerService{
    getProfile(userId:string):Promise<photographerProfileResponseDto>;
    editProfile(userId:string,data:editPhotographerProfileDto):Promise<photographerProfileResponseDto>;
}
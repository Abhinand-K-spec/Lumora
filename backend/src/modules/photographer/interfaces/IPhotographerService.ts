import type { editPhotographerProfileDto } from "../dto/editPhotographerProfileDto";
import type { photographerProfileResponseDto } from "../dto/photographerProfileResponseDto";

export interface IPhotographerService{
    getProfile(userId:string):Promise<photographerProfileResponseDto>;
    editProfile(userId:string,data:editPhotographerProfileDto):Promise<photographerProfileResponseDto>;
    getPhotographers(filters: { search?: string | undefined; district?: string | undefined; service?: string | undefined; price?: string | undefined; }): Promise<photographerProfileResponseDto[]>;
    addPackage(userId: string, data: {
        packageName: string;
        price: number;
        description: string;
        framesIncluded: boolean;
        droneIncluded: boolean;
        albumIncluded: boolean;
        status: string;
        videographersIncluded: boolean;
    }): Promise<photographerProfileResponseDto>;
    editPackage(userId: string, packageId: string, data: {
        packageName: string;
        price: number;
        description: string;
        framesIncluded: boolean;
        droneIncluded: boolean;
        albumIncluded: boolean;
        status: string;
        videographersIncluded: boolean;
    }): Promise<photographerProfileResponseDto>;
    deletePackage(userId: string, packageId: string): Promise<photographerProfileResponseDto>;
}
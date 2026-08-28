import type { IPackage } from "../../../shared/interfaces/IPackage.js";

export interface photographerProfileResponseDto{
    id:string;
    name:string;
    email:string;
    bio:string;
    phone:string;
    profilePhoto:string;
    coverPhoto:string;
    location:string;
    languages:string[];
    specialities:string[];
    equipment:string[];
    serviceRegions:string[];
    packages:IPackage[];
}
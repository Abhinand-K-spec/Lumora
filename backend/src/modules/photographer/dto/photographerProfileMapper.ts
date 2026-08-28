import type { IPhotographer } from "../../../shared/interfaces/IPhotographer.js";
import type { IUsers } from "../../../shared/interfaces/IUsers.js";
import type { IPackage } from "../../../shared/interfaces/IPackage.js";
import type { photographerProfileResponseDto } from "./photographerProfileResponseDto.js";

export class photographerProfileMapper{
    static toProfileResponse(user:IUsers,profile:IPhotographer,packages:IPackage[]):photographerProfileResponseDto{
        return{
            id: profile.userId,
            name: user.name,
            email: user.email,
            bio: profile.bio || "",
            phone: profile.phone || "",
            profilePhoto: profile.profilePhoto || "",
            coverPhoto: profile.coverPhoto || "",
            location: profile.location || "",
            languages: profile.languages || [],
            specialities: profile.specialities || [],
            equipment: profile.equipment || [],
            serviceRegions: profile.serviceRegions || [],
            packages: packages
        }
    }
}
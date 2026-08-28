import type { IPhotographer } from "../../../shared/interfaces/IPhotographer";
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { photographerProfileResponseDto } from "./photographerProfileResponseDto";

export class photographerProfileMapper{
    static toProfileResponse(user:IUsers,profile:IPhotographer):photographerProfileResponseDto{
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
            serviceRegions: profile.serviceRegions || []
        }
    }
}
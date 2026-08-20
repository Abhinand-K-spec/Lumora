import type { IUser } from "../../../shared/interfaces/IUser"
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { profileResponseDto } from "./profileResponseDto";



export class userProfileMapper{
    static toUserProfileResponse(
        user:IUsers,
        profile:IUser,
    ):profileResponseDto{
        return{
            id:profile.userId,
            name:user.name,
            email:user.email,
            phone:user.phone,
            profilePhoto:profile.profilePhoto
        }
    }
}
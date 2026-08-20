import type { editProfileDto } from "../dto/editProfileDto.js";
import type { profileResponseDto } from "../dto/profileResponseDto.js";

export interface IUserService {
    getProfile(userId:string): Promise<profileResponseDto>;
    editProfile(userId:string,data:editProfileDto):Promise<profileResponseDto>;
}

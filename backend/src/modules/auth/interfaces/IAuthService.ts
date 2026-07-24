import type { LoginUserDto } from "../dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../dto/LoginUserResponseDto.js";
import type{ RegisterUserDto } from "../dto/RegisterUserDto.js";



export interface IAuthService {
    register(data:RegisterUserDto):Promise<void>;
    login(data:LoginUserDto):Promise<LoginUserResponseDto>;
    refresh(accessToken:string):Promise<string>;
}
import type{ RegisterUserDto } from "../dto/RegisterUserDto.js";


export interface IAuthService {
    register(data:RegisterUserDto):Promise<void>;
}
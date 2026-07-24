import type { IUserRepository } from "../../../repositories/IUserRepository.js";
import { PasswordService } from "./PasswordService.js";
import { TokenService } from "./TokenService.js";
import type { IAuthService } from "../interfaces/IAuthService.js";
import type { RegisterUserDto } from "../dto/RegisterUserDto.js";
import { userRole } from "../../../shared/enums/UserRole.js";
import { accountStatus } from "../../../shared/enums/accountStatus.js";
import type { LoginUserDto } from "../dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../dto/LoginUserResponseDto.js";
import { AppError } from "../../../shared/errors/AppError.js";


export class AuthService implements IAuthService{
    constructor(
        private readonly userRepository:IUserRepository,
        private readonly passwordService:PasswordService,
        private readonly tokenService:TokenService
    ){}

    async register(data:RegisterUserDto):Promise<void>{
        const existing = await this.userRepository.findByEmail(data.email);

        if(existing){
            throw new AppError(409,'User already exists');
        }

        const hashedPassword = await this.passwordService.hashPassword(data.password);

        await this.userRepository.create({
            name:data.name,
            email:data.email,
            password:hashedPassword,
            role:userRole.USER,
            accountStatus:accountStatus.Active,
        })
    }


    async login(data: LoginUserDto): Promise<LoginUserResponseDto> {
        const user = await this.userRepository.findByEmail(data.email);

        if(!user){
            throw new AppError(409,'Invalid email');
        }

        const passwordValid = await this.passwordService.comparePassword(data.password,user.password);

        if(!passwordValid){
            throw new AppError(409,'Wrong password');
        }

        const accessToken = this.tokenService.generateAccessToken({id:user._id.toString(),role:user.role});
        const refreshToken = this.tokenService.generateRefreshToken({id:user._id,role:user.role});

        await this.userRepository.updateRefreshToken(user._id.toString(),refreshToken);

        return {
            accessToken,
            refreshToken,
            user:{
                id : user._id.toString(),
                name :user.name,
                email:user.email,
                role:user.role,
            }
        }
    }



}
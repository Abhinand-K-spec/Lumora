import type { IUserRepository } from "../../../repositories/IUserRepository.js";
import { PasswordService } from "./PasswordService.js";
import { TokenService } from "./TokenService.js";
import type { IAuthService } from "../interfaces/IAuthService.js";
import type { RegisterUserDto } from "../dto/RegisterUserDto.js";
import { userRole } from "../../../shared/enums/UserRole.js";
import { accountStatus } from "../../../shared/enums/accountStatus.js";


export class AuthService implements IAuthService{
    constructor(
        private readonly userRepository:IUserRepository,
        private readonly passwordService:PasswordService,
        private readonly tokenService:TokenService
    ){}

    async register(data:RegisterUserDto):Promise<void>{
        const existing = await this.userRepository.findByEmail(data.email);

        if(existing){
            throw new Error('User already exists');
        }

        const hashedPassword = this.passwordService.hashPassword(data.password);

        await this.userRepository.create({
            name:data.name,
            email:data.email,
            phone:data.phone,
            password:data.password,
            role:userRole.USER,
            accountStatus:accountStatus.Active,
        })
    }
}
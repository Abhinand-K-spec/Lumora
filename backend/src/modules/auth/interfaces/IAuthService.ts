import type { ForgotPasswordDto } from "../dto/ForgotPasswordDto.js";
import type { LoginUserDto } from "../dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../dto/LoginUserResponseDto.js";
import type{ RegisterUserDto } from "../dto/RegisterUserDto.js";
import type { ResendOtpDto } from "../dto/ResendOTPDto.js";
import type { ResetPasswordDto } from "../dto/ResetPasswordDto.js";
import type { VerifyEmailDto } from "../dto/VerifyEmailDto.js";



export interface IAuthService {
    register(data:RegisterUserDto):Promise<void>;
    login(data:LoginUserDto):Promise<LoginUserResponseDto>;
    refresh(accessToken:string):Promise<string>;
    verifyEmail(data: VerifyEmailDto):Promise<void>;
    resendOtp(data:ResendOtpDto):Promise<void>;
    forgotPassword(data:ForgotPasswordDto):Promise<void>;
    resetPassword(data: ResetPasswordDto): Promise<void>;
    logout(userId:string):Promise<void>;
}
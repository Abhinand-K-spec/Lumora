import type { ForgotPasswordDto } from "../../../user/auth/dto/ForgotPasswordDto.js";
import type { LoginUserDto } from "../../../user/auth/dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../../../user/auth/dto/LoginUserResponseDto.js";
import type { RegisterUserDto } from "../../../user/auth/dto/RegisterUserDto.js";
import type { ResendOtpDto } from "../../../user/auth/dto/ResendOTPDto.js";
import type { ResetPasswordDto } from "../../../user/auth/dto/ResetPasswordDto.js";
import type { VerifyEmailDto } from "../../../user/auth/dto/VerifyEmailDto.js";

export interface IPhotographerAuthService {
    register(data: RegisterUserDto): Promise<void>;
    login(data: LoginUserDto): Promise<LoginUserResponseDto>;
    refresh(refreshToken: string): Promise<string>;
    verifyEmail(data: VerifyEmailDto): Promise<void>;
    resendOtp(data: ResendOtpDto): Promise<void>;
    forgotPassword(data: ForgotPasswordDto): Promise<void>;
    resetPassword(data: ResetPasswordDto): Promise<void>;
    verifyResetOtp(data: VerifyEmailDto): Promise<void>;
    logout(userId: string): Promise<void>;
}

import type { IPhotographerRepository } from "../../repositories/IPhotographerRepository.js";
import { PasswordService } from "../../../user/auth/services/PasswordService.js";
import { TokenService } from "../../../user/auth/services/TokenService.js";
import { OTPService } from "../../../user/auth/services/OTPService.js";
import type { RegisterUserDto } from "../../../user/auth/dto/RegisterUserDto.js";
import { userRole } from "../../../../shared/enums/UserRole.js";
import { accountStatus } from "../../../../shared/enums/accountStatus.js";
import type { LoginUserDto } from "../../../user/auth/dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../../../user/auth/dto/LoginUserResponseDto.js";
import { AppError } from "../../../../shared/errors/AppError.js";
import { UserMapper } from "../../../user/auth/dto/UserMapper.js";
import type { IEmailService } from "../../../user/auth/interfaces/IEmailService.js";
import { verificationEmail } from "../../../user/auth/templates/email/verification.email.js";
import type { VerifyEmailDto } from "../../../user/auth/dto/VerifyEmailDto.js";
import type { ResendOtpDto } from "../../../user/auth/dto/ResendOTPDto.js";
import type { ForgotPasswordDto } from "../../../user/auth/dto/ForgotPasswordDto.js";
import { passwordResetEmail } from "../../../user/auth/templates/email/passwordReset.email.js";
import type { ResetPasswordDto } from "../../../user/auth/dto/ResetPasswordDto.js";
import type { IPhotographerAuthService } from "../interfaces/IPhotographerAuthService.js";

export class PhotographerAuthService implements IPhotographerAuthService {
    constructor(
        private readonly _photographerRepository: IPhotographerRepository,
        private readonly _passwordService: PasswordService,
        private readonly _tokenService: TokenService,
        private readonly _emailService: IEmailService,
        private readonly _otpService: OTPService
    ) {}

    async register(data: RegisterUserDto): Promise<void> {
        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();
        const hashedPassword = await this._passwordService.hashPassword(data.password);

        await this._photographerRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: userRole.PHOTOGRAPHER,
            accountStatus: accountStatus.Active,
            isEmailVerified: false,
            emailVerificationOtp: hashedOtp,
            emailVerificationOtpExpires: otpExpiry,
        });

        const html = verificationEmail(data.name, otp);
        this._emailService.sendEmail(
            data.email,
            "Verify your Lumora Account",
            html
        );
    }

    async login(data: LoginUserDto): Promise<LoginUserResponseDto> {
        const user = await this._photographerRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError(409, 'Invalid email or password');
        }

        const passwordValid = await this._passwordService.comparePassword(data.password, user.password);

        if (!passwordValid) {
            throw new AppError(409, 'Invalid email or password');
        }

        const accessToken = this._tokenService.generateAccessToken({ id: user._id.toString(), role: user.role });
        const refreshToken = this._tokenService.generateRefreshToken({ id: user._id.toString(), role: user.role });

        await this._photographerRepository.updateRefreshToken(user._id.toString(), refreshToken);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toLoginResponseUser(user)
        }
    }

    async refresh(refreshToken: string): Promise<string> {
        const payload = this._tokenService.verifyRefreshToken(refreshToken);
        const user = await this._photographerRepository.findById(payload.id);

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (user.refreshToken !== refreshToken) {
            throw new AppError(401, 'Refresh token is invalid');
        }

        const accessToken = this._tokenService.generateAccessToken({
            id: user._id.toString(),
            role: user.role,
        });
        return accessToken;
    }

    async verifyEmail(data: VerifyEmailDto): Promise<void> {
        const user = await this._photographerRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError(401, 'User not found');
        }

        if (user.isEmailVerified) {
            throw new AppError(400, "Email is already verified");
        }

        if (!user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date()) {
            throw new AppError(400, "OTP has expired");
        }

        if (!user.emailVerificationOtp) {
            throw new AppError(400, "No OTP found. Please request a new OTP.");
        }

        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.emailVerificationOtp);

        if (!isOtpValid) {
            throw new AppError(400, "Invalid OTP");
        }

        await this._photographerRepository.update(
            user._id.toString(),
            {
                isEmailVerified: true,
                emailVerificationOtp: null,
                emailVerificationOtpExpires: null
            }
        );
    }

    async resendOtp(data: ResendOtpDto): Promise<void> {
        const user = await this._photographerRepository.findByEmail(data.email); 

        if (!user) {
            throw new AppError(404, "User not found");
        }

        if (user.isEmailVerified) {
            throw new AppError(400, "Email is already verified.");
        }

        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();

        await this._photographerRepository.update(
            user._id.toString(),
            {
                emailVerificationOtp: hashedOtp,
                emailVerificationOtpExpires: otpExpiry
            }
        );

        const html = verificationEmail(user.name, otp);
        await this._emailService.sendEmail(
            user.email,
            "Verify your Lumora Account",
            html
        );
    }

    async forgotPassword(data: ForgotPasswordDto): Promise<void> {
        const user = await this._photographerRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();

        await this._photographerRepository.update(
            user._id.toString(),
            {
                passwordResetOtp: hashedOtp,
                passwordResetOtpExpiry: otpExpiry
            }
        );

        const html = passwordResetEmail(user.name, otp);
        await this._emailService.sendEmail(
            user.email,
            "Reset Your Lumora Password",
            html
        );
    }

    async resetPassword(data: ResetPasswordDto): Promise<void> {
        const user = await this._photographerRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError(404, "User not found");
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(400, "No reset OTP found.");
        }
    
        if (!user.passwordResetOtpExpiry || user.passwordResetOtpExpiry < new Date()) {
            throw new AppError(400, "OTP has expired");
        }
    
        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.passwordResetOtp);
        if (!isOtpValid) {
            throw new AppError(400, "Invalid OTP");
        }
    
        const hashedPassword = await this._passwordService.hashPassword(data.newPassword);
    
        await this._photographerRepository.update(user._id.toString(), {
            password: hashedPassword,
            passwordResetOtp: null,
            passwordResetOtpExpiry: null,
            refreshToken: null
        });
    }

    async verifyResetOtp(data: VerifyEmailDto): Promise<void> {
        const user = await this._photographerRepository.findByEmail(data.email);
    
        if (!user) {
            throw new AppError(404, "User not found");
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(400, "No reset OTP found.");
        }
    
        if (!user.passwordResetOtpExpiry || user.passwordResetOtpExpiry < new Date()) {
            throw new AppError(400, "OTP has expired");
        }
    
        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.passwordResetOtp);
    
        if (!isOtpValid) {
            throw new AppError(400, "Invalid OTP");
        }
    }

    async logout(userId: string): Promise<void> {
        const user = await this._photographerRepository.findById(userId);

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        await this._photographerRepository.update(
            userId,
            {
                refreshToken: null
            }
        );
    }
}

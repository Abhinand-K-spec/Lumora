import type { IPhotographerRepository } from "../../repositories/IPhotographerRepository.js";
import type { IPasswordService } from "../../../user/auth/interfaces/IPasswordService.js";
import type { ITokenService } from "../../../user/auth/interfaces/ITokenService.js";
import type { IOTPService } from "../../../user/auth/interfaces/IOTPService.js";
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
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";

export class PhotographerAuthService implements IPhotographerAuthService {
    constructor(
        private readonly _photographerRepository: IPhotographerRepository,
        private readonly _passwordService: IPasswordService,
        private readonly _tokenService: ITokenService,
        private readonly _emailService: IEmailService,
        private readonly _otpService: IOTPService
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        const passwordValid = await this._passwordService.comparePassword(data.password, user.password);

        if (!passwordValid) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.refreshToken !== refreshToken) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        if (!user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date()) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_EXPIRED);
        }

        if (!user.emailVerificationOtp) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.NO_OTP);
        }

        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.emailVerificationOtp);

        if (!isOtpValid) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_INVALID);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(HttpStatus.BAD_REQUEST, "No reset OTP found.");
        }
    
        if (!user.passwordResetOtpExpiry || user.passwordResetOtpExpiry < new Date()) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_INVALID);
        }
    
        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.passwordResetOtp);
        if (!isOtpValid) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_INVALID);
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
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(HttpStatus.BAD_REQUEST, "No reset OTP found.");
        }
    
        if (!user.passwordResetOtpExpiry || user.passwordResetOtpExpiry < new Date()) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_EXPIRED);
        }
    
        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.passwordResetOtp);
    
        if (!isOtpValid) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_INVALID);
        }
    }

    async logout(userId: string): Promise<void> {
        const user = await this._photographerRepository.findById(userId);

        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        await this._photographerRepository.update(
            userId,
            {
                refreshToken: null
            }
        );
    }
}

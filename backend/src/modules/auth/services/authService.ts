import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { IPasswordService } from "../interfaces/IPasswordService.js";
import type { ITokenService } from "../interfaces/ITokenService.js";
import type { IOTPService } from "../interfaces/IOTPService.js";
import type { IAuthService } from "../interfaces/IAuthService.js";
import type { IGoogleAuthService } from "../interfaces/IGoogleAuthService.js";
import type { IPhotographerRepository } from "../../photographer/repositories/IPhotographerRepository.js";
import type { IUserProfileRepository } from "../../user/repositories/IUserProfileRepository.js";
import type { RegisterUserDto } from "../dto/RegisterUserDto.js";
import { userRole } from "../../../shared/enums/UserRole.js";
import { accountStatus } from "../../../shared/enums/accountStatus.js";
import type { LoginUserDto } from "../dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../dto/LoginUserResponseDto.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserMapper } from "../dto/UserMapper.js";
import type { IEmailService } from "../../../shared/interfaces/IEmailService.js";
import { verificationEmail } from "../templates/email/verification.email.js";
import type { VerifyEmailDto } from "../dto/VerifyEmailDto.js";
import type { ResendOtpDto } from "../dto/ResendOTPDto.js";
import type { ForgotPasswordDto } from "../dto/ForgotPasswordDto.js";
import { passwordResetEmail } from "../templates/email/passwordReset.email.js";
import type { ResetPasswordDto } from "../dto/ResetPasswordDto.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";

export class AuthService implements IAuthService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _passwordService: IPasswordService,
        private readonly _tokenService: ITokenService,
        private readonly _emailService: IEmailService,
        private readonly _otpService: IOTPService,
        private readonly _googleAuthService: IGoogleAuthService,
        private readonly _photographerRepository: IPhotographerRepository,
        private readonly _userProfileRepository: IUserProfileRepository
    ) {}

    async register(data: RegisterUserDto): Promise<void> {
        const existing = await this._userRepository.findByEmail(data.email);

        if (existing) {
            throw new AppError(HttpStatus.CONFLICT, AUTH_MESSAGES.USER_ALREADY_LOGGED);
        }

        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();
        const hashedPassword = await this._passwordService.hashPassword(data.password);

        await this._userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: (data.role as userRole) || userRole.USER,
            accountStatus: accountStatus.Active,
            isEmailVerified: false,
            emailVerificationOtp: hashedOtp,
            emailVerificationOtpExpires: otpExpiry,
        });

        console.log('otp : ',otp);
        

        const html = verificationEmail(data.name, otp);
        this._emailService.sendEmail(
            data.email,
            "Verify your Lumora Account",
            html
        );
    }

    async login(data: LoginUserDto): Promise<LoginUserResponseDto> {
        const user = await this._userRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        if(user.accountStatus===accountStatus.Suspended){
            throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.SUSPENDED);
        }

        const passwordValid = await this._passwordService.comparePassword(data.password, user.password);

        if (!passwordValid) {
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        if (!user.isEmailVerified) {
            throw new AppError(HttpStatus.UNAUTHORIZED, "Please verify your email before logging in.");
        }

        const accessToken = this._tokenService.generateAccessToken({ id: user._id.toString(), role: user.role });
        const refreshToken = this._tokenService.generateRefreshToken({ id: user._id.toString(), role: user.role });

        await this._userRepository.updateRefreshToken(user._id.toString(), refreshToken);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toLoginResponseUser(user)
        }
    }

    async refresh(refreshToken: string): Promise<string> {
        const payload = this._tokenService.verifyRefreshToken(refreshToken);
        const user = await this._userRepository.findById(payload.id);

        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.refreshToken !== refreshToken) {
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
        }

        const accessToken = this._tokenService.generateAccessToken({
            id: user._id.toString(),
            role: user.role,
        });
        return accessToken;
    }

    async verifyEmail(data: VerifyEmailDto): Promise<void> {
        const user = await this._userRepository.findByEmail(data.email);

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

        await this._userRepository.update(
            user._id.toString(),
            {
                isEmailVerified: true,
                emailVerificationOtp: null,
                emailVerificationOtpExpires: null
            }
        );
    }

    async resendOtp(data: ResendOtpDto): Promise<void> {
        const user = await this._userRepository.findByEmail(data.email); 

        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();

        await this._userRepository.update(
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
        const user = await this._userRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        const otp = this._otpService.generateOTP();
        const hashedOtp = await this._passwordService.hashPassword(otp);
        const otpExpiry = this._otpService.getOTPExpiry();

        await this._userRepository.update(
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
        const user = await this._userRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.NO_OTP);
        }
    
        if (!user.passwordResetOtpExpiry || user.passwordResetOtpExpiry < new Date()) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_EXPIRED);
        }
    
        const isOtpValid = await this._passwordService.comparePassword(data.otp, user.passwordResetOtp);
        if (!isOtpValid) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.OTP_INVALID);
        }
    
        const hashedPassword = await this._passwordService.hashPassword(data.newPassword);
    
        await this._userRepository.update(user._id.toString(), {
            password: hashedPassword,
            passwordResetOtp: null,
            passwordResetOtpExpiry: null,
            refreshToken: null
        });
    }

    async verifyResetOtp(data: VerifyEmailDto): Promise<void> {
        const user = await this._userRepository.findByEmail(data.email);
    
        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }
    
        if (!user.passwordResetOtp) {
            throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.NO_OTP);
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
        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }

        await this._userRepository.updateRefreshToken(userId, null);
    }

    getGoogleAuthUrl(role: string): string {
        return this._googleAuthService.getGoogleAuthUrl(role);
    }

    async googleLogin(code: string, requestedRole: string): Promise<LoginUserResponseDto> {
        const googleUser = await this._googleAuthService.verifyGoogleUser(code);
        const email = googleUser.email;
        const name = googleUser.name;
        const googleId = googleUser.googleId;

        let user = await this._userRepository.findByEmail(email);
        let role = user ? user.role : requestedRole;

        if (!user) {
            user = await this._userRepository.create({
                name,
                email,
                password: '',
                googleId,
                role: requestedRole as userRole,
                isEmailVerified: true,
                accountStatus: accountStatus.Active
            });

            if (requestedRole === userRole.PHOTOGRAPHER) {
                await this._photographerRepository.create({
                    userId: user._id.toString(),
                    phone: '',
                    bio: ''
                });
            } else {
                await this._userProfileRepository.create({
                    userId: user._id.toString(),
                    phone: '',
                    profilePhoto: ''
                });
            }
        }

        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: role
        };

        const accessToken = this._tokenService.generateAccessToken(tokenPayload);
        const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

        await this._userRepository.updateRefreshToken(user._id.toString(), refreshToken);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toLoginResponseUser(user)
        };
    }

    async getUserById(userId: string): Promise<LoginUserResponseDto["user"]> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
        }
        return UserMapper.toLoginResponseUser(user);
    }
}

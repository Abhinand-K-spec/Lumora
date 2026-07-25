import type { IUserRepository } from "../../../repositories/IUserRepository.js";
import { PasswordService } from "./PasswordService.js";
import { TokenService } from "./TokenService.js";
import { OTPService } from './OTPService.js';
import type { IAuthService } from "../interfaces/IAuthService.js";
import type { RegisterUserDto } from "../dto/RegisterUserDto.js";
import { userRole } from "../../../shared/enums/UserRole.js";
import { accountStatus } from "../../../shared/enums/accountStatus.js";
import type { LoginUserDto } from "../dto/LoginUserDto.js";
import type { LoginUserResponseDto } from "../dto/LoginUserResponseDto.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserMapper } from "../dto/UserMapper.js";
import type { IEmailService } from "../interfaces/IEmailService.js";
import { verificationEmail } from "../templates/email/verification.email.js";
import type { VerifyEmailDto } from "../dto/VerifyEmailDto.js";
import type { ResendOtpDto } from "../dto/ResendOTPDto.js";


export class AuthService implements IAuthService{
    constructor(
        private readonly _userRepository:IUserRepository,
        private readonly _passwordService:PasswordService,
        private readonly _tokenService:TokenService,
        private readonly _emailService:IEmailService,
        private readonly _otpService:OTPService

    ){}

    async register(data:RegisterUserDto):Promise<void>{
        const existing = await this._userRepository.findByEmail(data.email);

        if(existing){
            throw new AppError(409,'User already exists');
        }

        const otp = this._otpService.generateOTP();

        const hashedOtp = await this._passwordService.hashPassword(otp);


        const otpExpiry = this._otpService.getOTPExpiry();

        const hashedPassword = await this._passwordService.hashPassword(data.password);

        await this._userRepository.create({
            name:data.name,
            email:data.email,
            password:hashedPassword,
            role:userRole.USER,
            accountStatus:accountStatus.Active,

            isEmailVerified: false,
            emailVerificationOtp: hashedOtp,
            emailVerificationOtpExpires: otpExpiry,
        });

        const html = verificationEmail(data.name,otp);

        await this._emailService.sendEmail(
            data.email,
            "Verify your Lumora Account",
            html
        );
    }


    async login(data: LoginUserDto): Promise<LoginUserResponseDto> {
        const user = await this._userRepository.findByEmail(data.email);

        if(!user){
            throw new AppError(409,'Invalid email or password');
        }

        const passwordValid = await this._passwordService.comparePassword(data.password,user.password);

        if(!passwordValid){
            throw new AppError(409,'Invalid email or password');
        }

        const accessToken = this._tokenService.generateAccessToken({id:user._id.toString(),role:user.role});
        const refreshToken = this._tokenService.generateRefreshToken({id:user._id.toString(),role:user.role});

        await this._userRepository.updateRefreshToken(user._id.toString(),refreshToken);

        return {
            accessToken,
            refreshToken,
            user:UserMapper.toLoginResponseUser(user)
        }
    }


    async refresh(refreshToken: string): Promise<string> {

        const payload = this._tokenService.verifyRefreshToken(refreshToken);

        const user = await this._userRepository.findById(payload.id);

        if(!user){
            throw new AppError(404,'User not found');
        }

        if(user.refreshToken!==refreshToken){
            throw new AppError(401,'Refresh token is invalid');
        }

        const accessToken = this._tokenService.generateAccessToken({
            id:user._id.toString(),
            role:user.role,
        })
        return accessToken;
    }

    async verifyEmail(data: VerifyEmailDto): Promise<void> {
        
        const user = await this._userRepository.findByEmail(data.email);

        if(!user){
            throw new AppError(401,'User not found');
        }

        if (user.isEmailVerified) {
            throw new AppError(
                400,
                "Email is already verified"
            );
        }

        if (
            !user.emailVerificationOtpExpires ||
            user.emailVerificationOtpExpires < new Date()
        ) {
            throw new AppError(
                400,
                "OTP has expired"
            );
        }

        if (!user.emailVerificationOtp) {
            throw new AppError(
                400,
                "No OTP found. Please request a new OTP."
            );
        }


        const isOtpValid = await this._passwordService.comparePassword(
            data.otp,
            user.emailVerificationOtp
        );

        if (!isOtpValid) {
            throw new AppError(
                400,
                "Invalid OTP"
            );
        }
    }


    async resendOtp(data: ResendOtpDto): Promise<void> {

        const user = await this._userRepository.findByEmail(data.email); 

        if (!user) {
            throw new AppError(404, "User not found");
        }

        if (user.isEmailVerified) {
            throw new AppError(
                400,
                "Email is already verified."
            );
        }


        const otp = this._otpService.generateOTP();

        const hashedOtp = await this._passwordService.hashPassword(
            otp
        );

        const otpExpiry = this._otpService.getOTPExpiry();

        await this._userRepository.update(
            user._id.toString(),
            {
                emailVerificationOtp: hashedOtp,
                emailVerificationOtpExpires: otpExpiry
            }
        );

        const html = verificationEmail(
            user.name,
            otp
        );
        
        await this._emailService.sendEmail(
            user.email,
            "Verify your Lumora Account",
            html
        );
    }



}
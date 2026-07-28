import type { Request, Response, NextFunction } from 'express';
import type { IPhotographerAuthService } from '../interfaces/IPhotographerAuthService.js';
import type { RegisterUserDto } from '../../../user/auth/dto/RegisterUserDto.js';
import type { LoginUserDto } from '../../../user/auth/dto/LoginUserDto.js';
import { AppError } from '../../../../shared/errors/AppError.js';

export class PhotographerAuthController {
    constructor(
        private readonly _authService: IPhotographerAuthService
    ) {}

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: RegisterUserDto = req.body;
            await this._authService.register(data);

            res.status(201).json({
                success: true,
                message: 'OTP send to the mail',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: LoginUserDto = req.body;
            const response = await this._authService.login(data);

            res.cookie("accessToken", response.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: 'Successfully logged in',
                data: {
                    user: response.user
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new AppError(401, 'Refresh token is missing');
            }

            const accessToken = await this._authService.refresh(refreshToken);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: "Access token refreshed successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyEmail(req.body);

            res.status(200).json({
                success: true,
                message: "Email verified successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resendOtp(req.body);

            res.status(200).json({
                success: true,
                message: "OTP sent successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.forgotPassword(req.body);

            res.status(200).json({
                success: true,
                message: "Password reset OTP sent successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resetPassword(req.body);

            res.status(200).json({
                success: true,
                message: "Password reset successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyResetOtp(req.body);

            res.status(200).json({
                success: true,
                message: 'OTP verified',
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError(401, "Unauthorized");
            }

            await this._authService.logout(req.user.id);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            next(error);
        }
    }
}

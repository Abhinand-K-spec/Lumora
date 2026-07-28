import type { Request, Response, NextFunction } from 'express';
import type { IAdminAuthService } from '../interfaces/IAdminAuthService.js';
import type { LoginAdminDto } from '../dto/LoginAdminDto.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { userRole } from '../../../../shared/enums/UserRole.js';

export class AdminAuthController {
    constructor(
        private readonly _authService: IAdminAuthService
    ) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: LoginAdminDto = req.body;
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
                message: 'Successfully logged in as admin',
                data: {
                    admin: response.admin
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

    async getCurrentAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || req.user.role !== userRole.ADMIN) {
                throw new AppError(403, "Forbidden");
            }
            const admin = await this._authService.getAdminById(req.user.id);

            res.status(200).json({
                success: true,
                message: "Current admin fetched successfully",
                admin
            });
        } catch (error) {
            next(error);
        }
    }
}

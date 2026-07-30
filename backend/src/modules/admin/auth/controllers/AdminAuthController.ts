import type{ Request, Response, NextFunction } from 'express';
import type { IAdminAuthService } from '../interfaces/IAdminAuthService.js';
import type { LoginAdminDto } from '../dto/LoginAdminDto.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { userRole } from '../../../../shared/enums/UserRole.js';
import { CookieUtil } from '../../../../shared/utils/cookie.util.js';
import { HttpStatus } from '../../../../shared/enums/HTTP.status.code.js';
import { AUTH_MESSAGES } from '../../../../shared/constants/message.constant.js';

export class AdminAuthController {
    constructor(
        private readonly _authService: IAdminAuthService
    ) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: LoginAdminDto = req.body;
            const response = await this._authService.login(data);

            CookieUtil.setAuthCookies(res,response.accessToken,response.refreshToken);
            
            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.ADMIN_LOGIN_SUCCESS,
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
                throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.ACCESS_TOKEN_MISSING);
            }

            const accessToken = await this._authService.refresh(refreshToken);

            CookieUtil.setAccessToken(res,accessToken)

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
            }
            await this._authService.logout(req.user.id);

            CookieUtil.clearAuthCookies(res);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.LOGOUT_SUCCESS
            });

        } catch (error) {
            next(error);
        }
    }

    async getCurrentAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || req.user.role !== userRole.ADMIN) {
                throw new AppError(HttpStatus.FORBIDDEN, "Forbidden");
            }
            const admin = await this._authService.getAdminById(req.user.id);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.CURRENT_ADMIN_FETCHED,
                admin
            });
        } catch (error) {
            next(error);
        }
    }
}

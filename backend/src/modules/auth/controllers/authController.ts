import type { Request, Response, NextFunction } from 'express';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { ITokenService } from '../interfaces/ITokenService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';
import type { LoginUserDto } from '../dto/LoginUserDto.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { CookieUtil } from '../../../shared/utils/cookie.util.js';
import { HttpStatus } from '../../../shared/enums/HTTP.status.code.js';
import { AUTH_MESSAGES } from '../../../shared/constants/message.constant.js';
import { userRole } from '../../../shared/enums/UserRole.js';
import { sendSuccess } from '../../../shared/utils/response.utils.js';

export class AuthController {
    constructor(
        private readonly _authService: IAuthService
    ) { }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: RegisterUserDto = req.body;
            await this._authService.register(data);

            sendSuccess(res,null,AUTH_MESSAGES.OTP_SENT,HttpStatus.CREATED);

        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: LoginUserDto = req.body;
            const response = await this._authService.login(data);

            CookieUtil.setAuthCookies(res, response.accessToken, response.refreshToken);

            sendSuccess(res,{user:response.user},AUTH_MESSAGES.LOGIN_SUCCESS);

        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
            }

            const accessToken = await this._authService.refresh(refreshToken);

            CookieUtil.setAccessToken(res, accessToken);

            sendSuccess(res,null,AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED);

        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyEmail(req.body);

            sendSuccess(res,null,AUTH_MESSAGES.EMAIL_VERIFIED);

        } catch (error) {
            next(error);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resendOtp(req.body);

            
            sendSuccess(res,null,AUTH_MESSAGES.OTP_SENT);

        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.forgotPassword(req.body);

            sendSuccess(res,null,AUTH_MESSAGES.PASSWORD_RESET_OTP_SENT);

        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resetPassword(req.body);

            sendSuccess(res,null,AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);

        } catch (error) {
            next(error);
        }
    }

    async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyResetOtp(req.body);

            sendSuccess(res,null,AUTH_MESSAGES.OTP_VERIFIED);
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

            sendSuccess(res,null,AUTH_MESSAGES.LOGIN_SUCCESS)

        } catch (error) {
            next(error);
        }
    }

    public googleLogin(req: Request, res: Response): void {
        const { role } = req.query;
        const state = typeof role === 'string' ? role : userRole.USER;
        const url = this._authService.getGoogleAuthUrl(state);

        res.redirect(url);
    }

    public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code, state } = req.query;
            if (typeof code !== 'string') {
                throw new AppError(HttpStatus.BAD_REQUEST, 'Google authorization code is required');
            }

            const requestedRole = (typeof state === 'string' && state === userRole.PHOTOGRAPHER) ? userRole.PHOTOGRAPHER : userRole.USER;

            const response = await this._authService.googleLogin(code, requestedRole);

            CookieUtil.setAuthCookies(res, response.accessToken, response.refreshToken);

            // Redirect back to frontend
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(clientUrl);
        } catch (error) {
            next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
            }

            const user = await this._authService.getUserById(req.user.id);

            sendSuccess(res,{user},AUTH_MESSAGES.CURRENT_USER_FETCHED);
           
        } catch (error) {
            next(error);
        }
    }
}

import type { Request, Response, NextFunction } from 'express';
import type { IUserAuthService } from '../interfaces/IUserAuthService.js';
import type { IGoogleAuthService } from '../interfaces/IGoogleAuthService.js';
import type { IUserRepository } from '../../general/controllers/repositories/IUserRepository.js';
import type { IPhotographerRepository } from '../../../photographer/repositories/IPhotographerRepository.js';
import type { ITokenService } from '../interfaces/ITokenService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';
import type { LoginUserDto } from '../dto/LoginUserDto.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { CookieUtil } from '../../../../shared/utils/cookie.util.js';
import { HttpStatus } from '../../../../shared/enums/HTTP.status.code.js';
import { AUTH_MESSAGES } from '../../../../shared/constants/message.constant.js';
import { userRole } from '../../../../shared/enums/UserRole.js';
import { accountStatus } from '../../../../shared/enums/accountStatus.js';

export class UserAuthController {
    constructor(
        private readonly _authService: IUserAuthService,
        private readonly _googleAuthService: IGoogleAuthService,
        private readonly _userRepository: IUserRepository,
        private readonly _photographerRepository: IPhotographerRepository,
        private readonly _tokenService: ITokenService
    ) {}

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: RegisterUserDto = req.body;
            await this._authService.register(data);

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: AUTH_MESSAGES.OTP_SENT,
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

            CookieUtil.setAuthCookies(res, response.accessToken, response.refreshToken);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.LOGIN_SUCCESS,
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
                throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
            }

            const accessToken = await this._authService.refresh(refreshToken);

            CookieUtil.setAccessToken(res,accessToken);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED,
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyEmail(req.body);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.EMAIL_VERIFIED
            });
        } catch (error) {
            next(error);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resendOtp(req.body);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.OTP_SENT
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.forgotPassword(req.body);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.PASSWORD_RESET_OTP_SENT
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resetPassword(req.body);

            res.status(HttpStatus.OK).json({
                success: true,
                message:AUTH_MESSAGES.PASSWORD_RESET_SUCCESS
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.verifyResetOtp(req.body);

            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.OTP_VERIFIED,
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


    public googleLogin(req: Request, res: Response): void {
        const { role } = req.query;
        const state = typeof role === 'string' ? role : userRole.USER;
        const url = this._googleAuthService.getGoogleAuthUrl(state);
    
        res.redirect(url);
    }
    
    public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code, state } = req.query;
            if (typeof code !== 'string') {
                throw new AppError(HttpStatus.BAD_REQUEST, 'Google authorization code is required');
            }

            const googleUser = await this._googleAuthService.verifyGoogleUser(code);
            const email = googleUser.email;
            const name = googleUser.name;
            const googleId = googleUser.googleId;
            const requestedRole = (typeof state === 'string' && state === userRole.PHOTOGRAPHER) ? userRole.PHOTOGRAPHER : userRole.USER;

            let user: any = null;
            let role: string = userRole.USER;

            // Check standard users
            user = await this._userRepository.findByEmail(email);
            if (user) {
                role = userRole.USER;
            } else {
                // Check photographers
                user = await this._photographerRepository.findByEmail(email);
                if (user) {
                    role = userRole.PHOTOGRAPHER;
                }
            }

            // Register if not found
            if (!user) {
                role = requestedRole;
                if (role === userRole.PHOTOGRAPHER) {
                    user = await this._photographerRepository.create({
                        name,
                        email,
                        password: '',
                        googleId,
                        role: userRole.PHOTOGRAPHER,
                        isVerified: true,
                        status: accountStatus.Active
                    } as any);
                } else {
                    user = await this._userRepository.create({
                        name,
                        email,
                        password: '',
                        googleId,
                        role: userRole.USER,
                        isVerified: true,
                        status: accountStatus.Active
                    } as any);
                }
            }

            // Generate JWT payload and tokens
            const tokenPayload = {
                id: user._id.toString(),
                email: user.email,
                role: role
            };

            const accessToken = this._tokenService.generateAccessToken(tokenPayload);
            const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

            CookieUtil.setAuthCookies(res,accessToken, refreshToken);

            // Redirect back to frontend
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(clientUrl);
        } catch (error) {
            next(error);
        }
    }
}

import type { Request, Response, NextFunction } from 'express';
import type { IUserAuthService } from '../interfaces/IUserAuthService.js';
import type { IGoogleAuthService } from '../interfaces/IGoogleAuthService.js';
import type { IUserRepository } from '../../repositories/IUserRepository.js';
import type { IPhotographerRepository } from '../../../photographer/repositories/IPhotographerRepository.js';
import type { ITokenService } from '../interfaces/ITokenService.js';
import type { RegisterUserDto } from '../dto/RegisterUserDto.js';
import type { LoginUserDto } from '../dto/LoginUserDto.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { CookieUtil } from '../../../../shared/utils/cookie.util.js';

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

            CookieUtil.setAuthCookies(res, response.accessToken, response.refreshToken);

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

            CookieUtil.setAccessToken(res,accessToken);

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

            CookieUtil.clearAuthCookies(res);

            res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            next(error);
        }
    }


    public googleLogin(req: Request, res: Response): void {
        const { role } = req.query;
        const state = typeof role === 'string' ? role : 'USER';
        const url = this._googleAuthService.getGoogleAuthUrl(state);
    
        res.redirect(url);
    }
    
    public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code, state } = req.query;
            if (typeof code !== 'string') {
                throw new AppError(400, 'Google authorization code is required');
            }

            const googleUser = await this._googleAuthService.verifyGoogleUser(code);
            const email = googleUser.email;
            const name = googleUser.name;
            const googleId = googleUser.googleId;
            const requestedRole = (typeof state === 'string' && state === 'PHOTOGRAPHER') ? 'PHOTOGRAPHER' : 'USER';

            let user: any = null;
            let role: string = 'USER';

            // Check standard users
            user = await this._userRepository.findByEmail(email);
            if (user) {
                role = 'USER';
            } else {
                // Check photographers
                user = await this._photographerRepository.findByEmail(email);
                if (user) {
                    role = 'PHOTOGRAPHER';
                }
            }

            // Register if not found
            if (!user) {
                role = requestedRole;
                if (role === 'PHOTOGRAPHER') {
                    user = await this._photographerRepository.create({
                        name,
                        email,
                        password: '',
                        googleId,
                        role: 'PHOTOGRAPHER',
                        isVerified: true,
                        status: 'ACTIVE'
                    } as any);
                } else {
                    user = await this._userRepository.create({
                        name,
                        email,
                        password: '',
                        googleId,
                        role: 'USER',
                        isVerified: true,
                        status: 'ACTIVE'
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

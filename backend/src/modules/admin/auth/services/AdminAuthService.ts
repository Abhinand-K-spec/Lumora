import type { IAdminRepository } from "../../repositories/IAdminRepository.js";
import type { IPasswordService } from "../../../user/auth/interfaces/IPasswordService.js";
import type { ITokenService } from "../../../user/auth/interfaces/ITokenService.js";
import type { IAdminAuthService } from "../interfaces/IAdminAuthService.js";
import type { LoginAdminDto } from "../dto/LoginAdminDto.js";
import type { LoginAdminResponseDto } from "../dto/LoginAdminResponseDto.js";
import { AppError } from "../../../../shared/errors/AppError.js";
import { AdminMapper } from "../dto/AdminMapper.js";
import { userRole } from "../../../../shared/enums/UserRole.js";

export class AdminAuthService implements IAdminAuthService {
    constructor(
        private readonly _adminRepository: IAdminRepository,
        private readonly _passwordService: IPasswordService,
        private readonly _tokenService: ITokenService
    ) {}

    async login(data: LoginAdminDto): Promise<LoginAdminResponseDto> {
        const admin = await this._adminRepository.findByEmail(data.email);

        if (!admin) {
            throw new AppError(401, 'Invalid email or password');
        }

        const passwordValid = await this._passwordService.comparePassword(data.password, admin.password);

        if (!passwordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        const accessToken = this._tokenService.generateAccessToken({ id: admin._id.toString(), role: userRole.ADMIN });
        const refreshToken = this._tokenService.generateRefreshToken({ id: admin._id.toString(), role: userRole.ADMIN });

        await this._adminRepository.updateRefreshToken(admin._id.toString(), refreshToken);

        return {
            accessToken,
            refreshToken,
            admin: AdminMapper.toLoginResponseAdmin(admin)
        };
    }

    async refresh(refreshToken: string): Promise<string> {
        const payload = this._tokenService.verifyRefreshToken(refreshToken);

        if (payload.role !== userRole.ADMIN) {
            throw new AppError(403, 'Forbidden');
        }

        const admin = await this._adminRepository.findById(payload.id);

        if (!admin) {
            throw new AppError(404, 'Admin not found');
        }

        if (admin.refreshToken !== refreshToken) {
            throw new AppError(401, 'Refresh token is invalid');
        }

        const accessToken = this._tokenService.generateAccessToken({
            id: admin._id.toString(),
            role: userRole.ADMIN,
        });

        return accessToken;
    }

    async logout(id: string): Promise<void> {
        const admin = await this._adminRepository.findById(id);

        if (!admin) {
            throw new AppError(404, 'Admin not found');
        }

        await this._adminRepository.updateRefreshToken(id, null);
    }

    async getAdminById(id: string): Promise<LoginAdminResponseDto["admin"]> {
        const admin = await this._adminRepository.findById(id);

        if (!admin) {
            throw new AppError(404, 'Admin not found');
        }

        return AdminMapper.toLoginResponseAdmin(admin);
    }
}

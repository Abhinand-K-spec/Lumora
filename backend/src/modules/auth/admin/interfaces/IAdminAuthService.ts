import type { LoginAdminDto } from "../dto/LoginAdminDto.js";
import type { LoginAdminResponseDto } from "../dto/LoginAdminResponseDto.js";

export interface IAdminAuthService {
    login(data: LoginAdminDto): Promise<LoginAdminResponseDto>;
    refresh(refreshToken: string): Promise<string>;
    logout(id: string): Promise<void>;
    getAdminById(id: string): Promise<LoginAdminResponseDto["admin"]>;
}

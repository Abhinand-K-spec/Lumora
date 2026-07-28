import type { userRole } from "../../../../shared/enums/UserRole.js";

export interface LoginAdminResponseDto {
    accessToken: string;
    refreshToken: string;
    admin: {
        id: string;
        name: string;
        email: string;
        role: userRole;
    };
}

import type { userRole } from "../../../shared/enums/UserRole.js";

export interface LoginUserResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: userRole;
    };
}

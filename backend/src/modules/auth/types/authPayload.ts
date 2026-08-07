import type { userRole } from "../../../shared/enums/UserRole.js";

export interface AuthPayload {
    id: string;
    role: userRole;
}

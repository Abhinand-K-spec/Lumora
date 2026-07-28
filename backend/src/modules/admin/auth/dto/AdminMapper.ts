import type { IAdmin } from "../../../../shared/interfaces/IAdmin.js";
import type { LoginAdminResponseDto } from "./LoginAdminResponseDto.js";
import { userRole } from "../../../../shared/enums/UserRole.js";

export class AdminMapper {
    static toLoginResponseAdmin(
        admin: IAdmin
    ): LoginAdminResponseDto["admin"] {
        return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: userRole.ADMIN
        };
    }
}

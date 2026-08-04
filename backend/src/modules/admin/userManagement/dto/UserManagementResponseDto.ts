import type { accountStatus } from "../../../../shared/enums/accountStatus.js";
import type { userRole } from "../../../../shared/enums/UserRole.js";

export interface UserManagementResponseDto {
  _id: string;
  name: string;
  email: string;
  role: userRole;
  accountStatus: accountStatus;
  createdAt: Date;
  updatedAt: Date;
}

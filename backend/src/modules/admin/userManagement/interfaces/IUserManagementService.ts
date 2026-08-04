import type { accountStatus } from "../../../../shared/enums/accountStatus.js";
import type { UserManagementResponseDto } from "../dto/UserManagementResponseDto.js";

export interface IUserManagementService {
  getUsers(): Promise<UserManagementResponseDto[]>;
  changeStatus(
    id: string,
    status: accountStatus,
  ): Promise<UserManagementResponseDto>;
  delete(id: string): Promise<void>;
}

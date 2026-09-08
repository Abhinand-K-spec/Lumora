import type { accountStatus } from "../../../../shared/enums/accountStatus.js";
import type { UserManagementResponseDto } from "../dto/UserManagementResponseDto.js";
import type { PaginationParams } from "../../../../shared/types/pagination.types.js";

export interface UserStatsResult {
  total: number;
  active: number;
  suspended: number;
}

export interface PaginatedUsersResult {
  users: UserManagementResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: UserStatsResult;
}

export interface IUserManagementService {
  getUsers(
    filters: {
      search?: string | undefined;
      status?: string | undefined;
      sortField?: string | undefined;
      sortOrder?: "asc" | "desc" | undefined;
    },
    pagination: PaginationParams
  ): Promise<PaginatedUsersResult>;
  changeStatus(
    id: string,
    status: accountStatus,
  ): Promise<UserManagementResponseDto>;
  delete(id: string): Promise<void>;
}

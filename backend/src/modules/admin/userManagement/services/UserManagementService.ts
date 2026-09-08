import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";
import { accountStatus } from "../../../../shared/enums/accountStatus.js";
import { userRole } from "../../../../shared/enums/UserRole.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../../shared/errors/AppError.js";
import type { IUserRepository } from "../../../auth/interfaces/IUserRepository.js";
import type { UserManagementResponseDto } from "../dto/UserManagementResponseDto.js";
import { UserManagementMapper } from "../dto/UserManagementMapper.js";
import type {
  IUserManagementService,
  PaginatedUsersResult,
} from "../interfaces/IUserManagementService.js";
import type { PaginationParams } from "../../../../shared/types/pagination.types.js";

export class UserManagementService implements IUserManagementService {
  constructor(private readonly _userRepository: IUserRepository) {}

  async getUsers(
    filters: {
      search?: string | undefined;
      status?: string | undefined;
      sortField?: string | undefined;
      sortOrder?: "asc" | "desc" | undefined;
    },
    pagination: PaginationParams
  ): Promise<PaginatedUsersResult> {
    const query: any = {
      role: userRole.USER,
      accountStatus: { $ne: accountStatus.Deleted },
    };

    if (filters.status && filters.status !== "ALL") {
      query.accountStatus = filters.status;
    }

    if (filters.search) {
      const searchRegex = { $regex: new RegExp(filters.search, "i") };
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortField =
      filters.sortField === "email"
        ? "email"
        : filters.sortField === "name"
        ? "name"
        : "createdAt";
    const sortOrder: 1 | -1 = filters.sortOrder === "desc" ? -1 : 1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.max(1, Math.min(100, pagination?.limit || 5));
    const skip = (page - 1) * limit;

    const [[users, total], stats] = await Promise.all([
      this._userRepository.findAllPaginated(query, skip, limit, sort),
      this._userRepository.countByStatus(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: UserManagementMapper.toResponseDtoList(users),
      total,
      page,
      limit,
      totalPages,
      stats,
    };
  }

  async changeStatus(
    id: string,
    status: accountStatus,
  ): Promise<UserManagementResponseDto> {
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    await this._userRepository.changeStatus(id, status);
    const updatedUser = await this._userRepository.findById(id);
    if (!updatedUser) {
      throw new AppError(HttpStatus.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return UserManagementMapper.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    await this._userRepository.delete(id);
  }
}

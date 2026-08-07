import type { IUsers } from "../../../../shared/interfaces/IUsers.js";
import type { UserManagementResponseDto } from "./UserManagementResponseDto.js";

export class UserManagementMapper {
  static toResponseDto(user: IUsers): UserManagementResponseDto {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponseDtoList(users: IUsers[]): UserManagementResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}

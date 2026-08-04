import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";
import { accountStatus } from "../../../../shared/enums/accountStatus.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../../shared/errors/AppError.js";
import type { UserRepository } from "../../../user/repositories/UserRepository.js";
import type { UserManagementResponseDto } from "../dto/UserManagementResponseDto.js";
import { UserManagementMapper } from "../dto/UserManagementMapper.js";
import type { IUserManagementService } from "../interfaces/IUserManagementService.js";

export class UserManagementService implements IUserManagementService {
  constructor(private readonly _userRepository: UserRepository) {}

  async getUsers(): Promise<UserManagementResponseDto[]> {
    const response = await this._userRepository.find();
    return UserManagementMapper.toResponseDtoList(response);
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

import type { IUserService } from "../interfaces/IUserService.js";
import type { IUserRepository } from "../../auth/repositories/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserMapper } from "../../auth/dto/UserMapper.js";

export class UserService implements IUserService {
    constructor(
        private readonly _userRepository: IUserRepository
    ) {}

    async getCurrentUser(userId: string) {
        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return UserMapper.toLoginResponseUser(user);
    }
}

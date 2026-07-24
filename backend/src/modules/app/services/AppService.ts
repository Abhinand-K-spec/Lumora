import type { IAppService } from "../interfaces/IAppService.js";
import type { IUserRepository } from "../../../repositories/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserMapper } from "../../auth/dto/UserMapper.js";

export class AppService implements IAppService {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async getCurrentUser(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return UserMapper.toLoginResponseUser(user);
    }
}
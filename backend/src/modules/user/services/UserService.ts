import type { IUserService } from "../interfaces/IUserService.js";
import type { IUserRepository } from "../repositories/IUserRepository.js";
import type { IPhotographerRepository } from "../../photographer/repositories/IPhotographerRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserMapper } from "../auth/dto/UserMapper.js";

export class UserService implements IUserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly photographerRepository: IPhotographerRepository
    ) {}

    async getCurrentUser(userId: string) {
        let user: any = await this.userRepository.findById(userId);
        if (!user) {
            user = await this.photographerRepository.findById(userId);
        }

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return UserMapper.toLoginResponseUser(user);
    }
}

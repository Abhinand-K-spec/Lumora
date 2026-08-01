import User from "../../../shared/models/user.model.js";
import type { IUser } from "../../../shared/interfaces/IUser.js";
import type { IUserRepository } from "./IUserRepository.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository
{
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async updateRefreshToken(id: string,refreshToken: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            id,
            { refreshToken },
            { new: true }
        );
    }
}

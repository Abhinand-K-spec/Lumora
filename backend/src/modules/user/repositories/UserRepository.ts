import User from "../../../shared/models/user.model";
import type { IUser } from "../../../shared/interfaces/IUser";
import type { IUserRepository } from "./IUserRepository.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository";

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

import type { IUser } from "../../../shared/interfaces/IUser.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import User from "../../../shared/models/user.model.js";
import type { IUserProfileRepository } from "./IUserProfileRepository.js";

export class UserProfileRepository extends BaseRepository<IUser> implements IUserProfileRepository {
    constructor() {
        super(User);
    }

    async findByUserId(userId: string): Promise<IUser | null> {
        return await User.findOne({ userId });
    }
}

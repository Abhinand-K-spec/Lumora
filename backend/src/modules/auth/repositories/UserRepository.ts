import Users from "../../../shared/models/users.model";
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import { accountStatus } from "../../../shared/enums/accountStatus";

export class UserRepository extends BaseRepository<IUsers> implements IUserRepository {
    constructor() {
        super(Users);
    }

    async findByEmail(email: string): Promise<IUsers | null> {
        return await Users.findOne({ email, accountStatus: { $ne: accountStatus.Deleted } });
    }

    async updateRefreshToken(id: string, refreshToken: string | null): Promise<IUsers | null> {
        return await Users.findByIdAndUpdate(
            id,
            { refreshToken },
            { new: true }
        );
    }

    async changeStatus(id: string, status: accountStatus): Promise<void> {
        await Users.findByIdAndUpdate(id, { accountStatus: status });
    }

    async delete(id: string): Promise<void> {
        await Users.findByIdAndUpdate(id, { accountStatus: accountStatus.Deleted })
    }
}

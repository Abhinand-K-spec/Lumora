import Users from "../../../shared/models/users.model";
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import { accountStatus } from "../../../shared/enums/accountStatus";
import { userRole } from "../../../shared/enums/UserRole.js";

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

    async findWithFilter(filter: any): Promise<IUsers[]> {
        return await Users.find(filter);
    }

    async findAllPaginated(
        filter: any,
        skip: number,
        limit: number,
        sort: Record<string, 1 | -1> = { createdAt: -1 }
    ): Promise<[IUsers[], number]> {
        const [users, total] = await Promise.all([
            Users.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            Users.countDocuments(filter).exec(),
        ]);
        return [users, total];
    }

    async countByStatus(): Promise<{ total: number; active: number; suspended: number }> {
        const baseFilter = {
            role: userRole.USER,
            accountStatus: { $ne: accountStatus.Deleted }
        };

        const [total, active, suspended] = await Promise.all([
            Users.countDocuments(baseFilter).exec(),
            Users.countDocuments({ ...baseFilter, accountStatus: accountStatus.Active }).exec(),
            Users.countDocuments({ ...baseFilter, accountStatus: accountStatus.Suspended }).exec()
        ]);

        return { total, active, suspended };
    }
}

import User from "../../../shared/models/user.model";
import type { IUser } from "../../../shared/interfaces/IUser";
import type { IUserRepository } from "./IUserRepository.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import { accountStatus } from "../../../shared/enums/accountStatus";

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

    async changeStatus(id: string,status:accountStatus): Promise<void> {
        await User.findByIdAndUpdate({_id:id},{accountStatus:status});
    }

    async delete(id:string):Promise<void>{
        await User.findByIdAndUpdate({id:id},{accountStatus:accountStatus.Deleted})
    }
}

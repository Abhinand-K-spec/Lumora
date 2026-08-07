import type { IUser } from "../../../shared/interfaces/IUser.js";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository.js";

export interface IUserProfileRepository extends IBaseRepository<IUser> {
    findByUserId(userId: string): Promise<IUser | null>;
}

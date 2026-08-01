import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";
import type { IUser } from "../../../shared/interfaces/IUser";

export interface IUserRepository extends IBaseRepository<IUser> {
    findByEmail(email: string): Promise<IUser | null>;

    updateRefreshToken(id: string,refreshToken: string): Promise<IUser | null>;
}
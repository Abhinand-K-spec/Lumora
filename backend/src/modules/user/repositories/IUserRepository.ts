import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";
import type { IUser } from "../../../shared/interfaces/IUser";
import type { accountStatus } from "../../../shared/enums/accountStatus";

export interface IUserRepository extends IBaseRepository<IUser> {
    findByEmail(email: string): Promise<IUser | null>;

    updateRefreshToken(id: string,refreshToken: string): Promise<IUser | null>;
    changeStatus(id:string,status:accountStatus):Promise<void>;

    delete(id:string):Promise<void>;
}
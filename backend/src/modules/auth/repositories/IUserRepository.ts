import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { accountStatus } from "../../../shared/enums/accountStatus";

export interface IUserRepository extends IBaseRepository<IUsers> {
    findByEmail(email: string): Promise<IUsers | null>;

    update(id: string, data: Partial<IUsers>): Promise<IUsers | null>;

    updateRefreshToken(id: string,refreshToken: string | null): Promise<IUsers | null>;
    changeStatus(id:string,status:accountStatus):Promise<void>;

    delete(id:string):Promise<void>;

}
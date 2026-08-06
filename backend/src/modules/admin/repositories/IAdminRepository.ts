import type { IUser } from "../../../shared/interfaces/IUsers.js";
import type { IAdmin } from "../../../shared/models/admin.model.js";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository.js";

export interface IAdminRepository extends IBaseRepository<IAdmin> {
    findByEmail(email: string): Promise<IAdmin | null>;
    update(id:string,date: Partial<IAdmin>):Promise <IAdmin | null>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
}
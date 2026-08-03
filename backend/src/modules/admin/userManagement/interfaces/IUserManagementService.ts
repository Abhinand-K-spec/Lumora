import type { accountStatus } from "../../../../shared/enums/accountStatus";
import type { IUser } from "../../../../shared/interfaces/IUser";

export interface IUserManagementService{
    getUsers():Promise<IUser[]>;
    changeStatus(id:string,status:accountStatus):Promise<void>;
    delete(id:string):Promise<void>;
}
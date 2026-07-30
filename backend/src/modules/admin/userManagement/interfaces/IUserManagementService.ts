import type { IUser } from "../../../../shared/interfaces/IUser";

export interface IUserManagementService{
    getUsers():Promise<IUser[]>;
}
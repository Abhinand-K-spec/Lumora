import type { IUser } from "../../../../shared/interfaces/IUser";
import type { AdminRepository } from "../../repositories/AdminRepository";

export class UserManagementService{
    constructor(
        private readonly _adminRepository:AdminRepository
    ){}


    async getUsers():Promise<IUser[]>{
        const response = await this._adminRepository.getUsers();
        return response;
    }
}
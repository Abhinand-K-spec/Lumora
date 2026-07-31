import type { IUser } from "../../../../shared/interfaces/IUser";
import type { UserRepository } from "../../../user/repositories/UserRepository";


export class UserManagementService{
    constructor(
        private readonly _userRepository:UserRepository
    ){}


    async getUsers():Promise<IUser[]>{
        const response = await this._userRepository.getUsers();
        return response;
    }
}
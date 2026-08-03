import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant";
import { accountStatus } from "../../../../shared/enums/accountStatus";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../../shared/errors/AppError";
import type { IUser } from "../../../../shared/interfaces/IUser";
import type { UserRepository } from "../../../user/repositories/UserRepository";


export class UserManagementService{
    constructor(
        private readonly _userRepository:UserRepository
    ){}


    async getUsers():Promise<IUser[]>{
        const response = await this._userRepository.find();
        return response;
    }

    async changeStatus(id:string,status:accountStatus):Promise<void>{
        if(!id){
            throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.USER_NOT_FOUND);
        }

        await this._userRepository.changeStatus(id,status);
    }


    async delete(id:string):Promise<void>{
        if(!id){
            throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.USER_NOT_FOUND);
        }

        await this._userRepository.delete(id);
    }
}
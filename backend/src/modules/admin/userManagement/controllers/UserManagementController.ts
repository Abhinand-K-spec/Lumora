import type { IUser } from "../../../../shared/interfaces/IUser";
import type { IUserManagementService } from "../interfaces/IUserManagementService";
import type { Request,Response } from "express";




export class UserManagementController{
    constructor(
        private readonly _userManagementService:IUserManagementService
    ){}


    async getUsers(req:Request,res:Response):Promise<IUser[]>{
        const response = await this._userManagementService.getUsers();
        return response;
    }
}
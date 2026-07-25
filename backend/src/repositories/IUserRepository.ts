import type { IUser } from "../interfaces/IUser.js";


export interface IUserRepository {
    create(user :Partial <IUser>) : Promise <IUser>;
    findById(id : string) : Promise <IUser | null>;
    findByEmail(email:string) : Promise <IUser | null>;
    update(id:string, data:Partial<IUser>) : Promise<IUser | null>;
    deleteById(id:string) : Promise<boolean>;
    exists(email:string) : Promise<boolean>;
    updateRefreshToken(id:string, refreshToken:string):Promise<IUser|null>;
}
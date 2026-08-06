import type { IUser } from "../interfaces/IUsers";

export interface IBaseRepository<T>{
    find():Promise<T[]>;

    create(user :Partial <T>) : Promise <T>;

    findById(id : string) : Promise <T | null>;

    exists(email:string) : Promise<boolean>;

}
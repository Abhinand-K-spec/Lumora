import User from "../models/user.model.js";
import type { IUser } from "../interfaces/IUser.js";
import type { IUserRepository } from "./IUserRepository.js";

export class UserRepository implements IUserRepository{
    async create(user:IUser):Promise <IUser>{
        return await User.create(user);
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,data,{
            new:true
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = User.deleteOne({id});
        return !!result;
    }

    async exists(email: string): Promise<boolean> {
        const user = User.find({email});
        return !!user;
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,{refreshToken,new :true})
    }
}
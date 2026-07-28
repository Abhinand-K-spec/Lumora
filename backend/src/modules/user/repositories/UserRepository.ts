import User from "../../../shared/models/user.model.js";
import type { IUser } from "../../../shared/interfaces/IUser.js";
import type { IUserRepository } from "./IUserRepository.js";

export class UserRepository implements IUserRepository{
    async create(user: Partial<IUser>):Promise <IUser>{
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

    async deleteById(id: string): Promise<boolean> {
        const result = await User.deleteOne({ _id:id });
        return !!result;
    }

    async exists(email: string): Promise<boolean> {
        const user = await User.findOne({ email });

        return !!user;
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,{refreshToken},{new :true})
    }
}

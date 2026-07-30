import type { IAdminRepository } from "./IAdminRepository.js";
import type { IAdmin } from "../../../shared/models/admin.model.js";
import { Admin } from "../../../shared/models/admin.model.js";
import User from "../../../shared/models/user.model.js";
import type { IUser } from "../../../shared/interfaces/IUser.js";


export class AdminRepository implements IAdminRepository {

    async create(admin: Partial<IAdmin>): Promise<IAdmin> {
        return await Admin.create(admin);
    }

    async findById(id: string): Promise<IAdmin | null> {
        return await Admin.findById(id);
    }

    async findByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({ email });
    }

    async update(
        id: string,
        data: Partial<IAdmin>
    ): Promise<IAdmin | null> {
        return await Admin.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }

    async updateRefreshToken(
        id: string,
        refreshToken: string | null
    ): Promise<void> {
        await Admin.findByIdAndUpdate(id, {
            refreshToken
        });
    }

    async delete(id: string): Promise<void> {
        await Admin.findByIdAndDelete(id);
    }

    async getUsers():Promise<IUser[]>{
        const users = await User.find()
        return users;
    }
}
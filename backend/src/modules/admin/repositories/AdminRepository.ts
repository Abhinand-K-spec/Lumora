import type { IAdminRepository } from "./IAdminRepository.js";
import type { IAdmin } from "../../../shared/models/admin.model.js";
import { Admin } from "../../../shared/models/admin.model.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";


export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {

    constructor(){
        super(Admin);
    };

    async findByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({ email });
    }

    async update(id: string,data: Partial<IAdmin>): Promise<IAdmin | null> {
        return await Admin.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }

    async updateRefreshToken(id: string,refreshToken: string | null): Promise<void> {
        await Admin.findByIdAndUpdate(id, {
            refreshToken
        });
    }


}
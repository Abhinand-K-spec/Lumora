import type { IAdmin } from "../../../shared/models/admin.model.js";

export interface IAdminRepository {
    findByEmail(email: string): Promise<IAdmin | null>;
    findById(id: string): Promise<IAdmin | null>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
}
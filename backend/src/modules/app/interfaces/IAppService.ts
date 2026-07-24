import type { IUser } from "../../../interfaces/IUser.js"; 

export interface IAppService {
    getCurrentUser(userId: string): Promise<IUser | null>;
}
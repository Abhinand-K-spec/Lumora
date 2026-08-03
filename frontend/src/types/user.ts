import type { accountStatus } from "../../../backend/src/shared/enums/accountStatus";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    accountStatus: accountStatus;
}
export type accountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    accountStatus: accountStatus;
    createdAt?: string;
}
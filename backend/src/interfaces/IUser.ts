import {userRole} from '../shared/enums/UserRole.js';
import { Types } from 'mongoose';

export interface IUser{
    _id: Types.ObjectId;
    email:string;
    phone:string;
    bio:string;
    profilePhoto?:string;
    refreshToken?:string | null;
    role:userRole;
    name:string;
    password:string;
    updatedAt:Date;
    createdAt:Date;
    accountStatus:string;
    isEmailVerified:boolean;
    emailVerificationOtp?:string|null;
    emailVerificationOtpExpires?:Date|null;
    passwordResetOtp?:string |null;
    passwordResetOtpExpiry?:Date | null;
}
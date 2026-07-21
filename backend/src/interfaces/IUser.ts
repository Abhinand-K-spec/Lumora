import {userRole} from '../shared/enums/UserRole.js';
import { Types } from 'mongoose';

export interface IUser{
    _id: Types.ObjectId;
    email:string;
    phone:string;
    bio:string;
    profilePhoto?:string;
    role:userRole;
    name:string;
    password:string;
    updatedAt:Date;
    createdAt:Date;
    accountStatus:string;
}
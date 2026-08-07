import {userRole} from '../enums/UserRole.js';
import { Types } from 'mongoose';

export interface IUser{
    _id: Types.ObjectId;
    userId:string;
    phone:string;
    profilePhoto:string;
    updatedAt:Date;
    createdAt:Date;
}
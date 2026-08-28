import {userRole} from '../enums/UserRole.js';
import { Types } from 'mongoose';

export interface IPhotographer {
    _id: Types.ObjectId;
    userId:string;
    bio:string;
    profilePhoto?:string;
    coverPhoto?:string;
    location?:string;
    languages?:string[];
    specialities?:string[];
    equipment?:string[];
    serviceRegions?:string[];
    updatedAt:Date;
    createdAt:Date;
    phone:string;
}

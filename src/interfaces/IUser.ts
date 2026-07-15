import {userRole} from '../shared/enums/UserRole.js';


export interface IUser{
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
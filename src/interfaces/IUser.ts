import {userRole} from '../shared/enums/UserRole.js';


export interface IUser{
    email:string;
    phone:number;
    bio:string;
    profilePhoto?:string;
    role:userRole;
    name:string;
    password:string;
    updatedAt:Date;
    createdAt:Date;
    accountStatus:string;
}
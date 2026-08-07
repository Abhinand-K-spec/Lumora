import {Schema, model} from 'mongoose';
import {userRole} from '../enums/UserRole.js';
import type {IUsers} from '../interfaces/IUsers.js';
import { accountStatus } from '../enums/accountStatus.js';


const userSchema = new Schema<IUsers>(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },

        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
        },

        password:{
            type:String,
        },

        phone:{
            type:String,
            trim:true
        },
        isEmailVerified:{
            type:Boolean,
            default:false,
        },
        emailVerificationOtp: {
            type: String,
            default: null,
        },
        
        emailVerificationOtpExpires: {
            type: Date,
            default: null,
        },

        role:{
            type:String,
            enum:Object.values(userRole),
            default:userRole.USER,
            required:true
        },

        accountStatus:{
            type:String,
            enum:Object.values(accountStatus),
            default:accountStatus.Active
        },
        refreshToken:{
            type:String
        },

        passwordResetOtp:{
            type:String
        },

        passwordResetOtpExpiry:{
            type:Date
        },
        googleId:{
            type:String,
            default:null
        }

    },

    {
        timestamps:true
    }
)

const Users = model<IUsers>('Users',userSchema);
export default Users;
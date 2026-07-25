import {Schema, model} from 'mongoose';
import {userRole} from '../shared/enums/UserRole.js';
import type {IUser} from '../interfaces/IUser.js';
import { accountStatus } from '../shared/enums/accountStatus.js';


const userSchema = new Schema<IUser>(
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
            required:true
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
        profilePhoto:{
            type:String,
            default:null,
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
            defaul:accountStatus.Active
        },
        refreshToken:{
            type:String
        }

    },

    {
        timestamps:true
    }
)

const User = model<IUser>('User',userSchema);
export default User;
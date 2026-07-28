import {Schema, model} from 'mongoose';
import {userRole} from '../enums/UserRole.js';
import type {IPhotographer} from '../interfaces/IPhotographer.js';
import { accountStatus } from '../enums/accountStatus.js';

const photographerSchema = new Schema<IPhotographer>(
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
        
        bio:{
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
            default:userRole.PHOTOGRAPHER,
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
        }

    },

    {
        timestamps:true
    }
)

const Photographer = model<IPhotographer>('Photographer', photographerSchema);
export default Photographer;

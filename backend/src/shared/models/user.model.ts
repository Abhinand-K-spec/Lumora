import {Schema, model} from 'mongoose';
import type {IUser} from '../interfaces/IUser.js';


const userSchema = new Schema<IUser>(
    {
        userId:{
            type:String,
        },

        phone:{
            type:String,
            trim:true
        },

        profilePhoto:{
            type:String,
            default:null,
        },

    },

    {
        timestamps:true
    }
)

const User = model<IUser>('User', userSchema, 'userProfiles');
export default User;
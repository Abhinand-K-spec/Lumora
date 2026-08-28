import {Schema, model} from 'mongoose';
import type {IPhotographer} from '../interfaces/IPhotographer.js';

const photographerSchema = new Schema<IPhotographer>(
    {
        phone:{
            type:String,
            trim:true
        },
        userId:{
            type:String,
        },
        
        bio:{
            type:String,
            trim:true
        },
        profilePhoto:{
            type:String,
            trim:true
        },
        coverPhoto:{
            type:String,
            trim:true
        },
        location:{
            type:String,
            trim:true
        },
        languages:{
            type:[String],
            default:[]
        },
        specialities:{
            type:[String],
            default:[]
        },
        equipment:{
            type:[String],
            default:[]
        },
        serviceRegions:{
            type:[String],
            default:[]
        },

    },

    {
        timestamps:true
    }
)

const Photographer = model<IPhotographer>('Photographer', photographerSchema);
export default Photographer;

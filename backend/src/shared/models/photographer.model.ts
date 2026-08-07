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

    },

    {
        timestamps:true
    }
)

const Photographer = model<IPhotographer>('Photographer', photographerSchema);
export default Photographer;

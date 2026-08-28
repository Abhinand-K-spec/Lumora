import { Schema, model } from 'mongoose';
import type { IPackage } from '../interfaces/IPackage.js';

const packageSchema = new Schema<IPackage>(
    {
        photographerId: {
            type: Schema.Types.ObjectId,
            ref: 'Photographer',
            required: true
        },
        packageName: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        framesIncluded: {
            type: Boolean,
            default: false
        },
        droneIncluded: {
            type: Boolean,
            default: false
        },
        albumIncluded: {
            type: Boolean,
            default: false
        },
        videographersIncluded: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

const Package = model<IPackage>('Package', packageSchema);
export default Package;

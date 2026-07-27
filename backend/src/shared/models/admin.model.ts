import { Schema, model } from 'mongoose';
import type { IAdmin } from '../interfaces/IAdmin.js';

const adminSchema = new Schema<IAdmin>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Admin = model<IAdmin>('Admin', adminSchema);
export type { IAdmin } from '../interfaces/IAdmin.js';
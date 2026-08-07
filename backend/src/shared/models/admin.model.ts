import { Schema, model } from "mongoose";
import type { IAdmin } from "../interfaces/IAdmin.js";

const adminSchema = new Schema<IAdmin>(
  {
    userId:{
      type:String,
    },
  },
  {
    timestamps: true,
  },
);

export const Admin = model<IAdmin>("Admin", adminSchema);
export type { IAdmin } from "../interfaces/IAdmin.js";

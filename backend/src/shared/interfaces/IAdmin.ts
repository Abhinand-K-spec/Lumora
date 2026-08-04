import { Document, Types } from "mongoose";
import { userRole } from "../enums/UserRole.js";

export interface IAdmin extends Document {
  _id: Types.ObjectId;

  name: string;
  email: string;
  password: string;

  refreshToken?: string | null;
  role: userRole;

  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";
import { userRole } from "../enums/UserRole.js";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  userId:string;

  createdAt: Date;
  updatedAt: Date;
}

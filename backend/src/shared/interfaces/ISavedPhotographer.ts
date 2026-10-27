import type { Document } from "mongoose";

export interface ISavedPhotographer extends Document {
  userId: string;
  photographerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

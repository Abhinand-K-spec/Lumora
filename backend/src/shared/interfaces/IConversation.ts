
import { Types } from "mongoose";

export interface IConversation {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  photographerId: Types.ObjectId;

  lastMessage?: string;

  lastMessageAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

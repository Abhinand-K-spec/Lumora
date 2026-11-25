
import { Types } from "mongoose";

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
}

export interface IMessage {
  _id: Types.ObjectId;

  conversationId: Types.ObjectId;

  senderId: Types.ObjectId;

  content: string;

  type: MessageType;

  isRead: boolean;

  readAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

import { Types } from "mongoose";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";
import type { IMessage } from "../../../shared/interfaces/IMessage.js";

export interface IMessageRepository extends IBaseRepository<IMessage> {
  findByConversationId(
    conversationId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<IMessage[]>;

  markAsRead(
    conversationId: Types.ObjectId,
    readerId: Types.ObjectId
  ): Promise<void>;

  findUnreadCount(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<number>;
}

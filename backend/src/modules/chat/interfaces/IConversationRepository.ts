import type { Types } from "mongoose";
import type { IConversation } from "../../../shared/interfaces/IConversation.js";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository.js";

export interface IConversationRepository extends IBaseRepository<IConversation> {
  findByParticipants(
    userId: Types.ObjectId,
    photographerId: Types.ObjectId
  ): Promise<IConversation | null>;
  findByUserId(userId: Types.ObjectId): Promise<IConversation[]>;
  findByPhotographerId(
    photographerId: Types.ObjectId
  ): Promise<IConversation[]>;
  findByAnyParticipant(
    userId: Types.ObjectId
  ): Promise<IConversation[]>;
  updateLastMessage(
    conversationId: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<IConversation | null>;
}

import { Types } from "mongoose";
import type { IConversation } from "../../../shared/interfaces/IConversation.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import type { IConversationRepository } from "../interfaces/IConversationRepository.js";
import Conversation from "../../../shared/models/conversation.model.js";

class ConversationRepository
  extends BaseRepository<IConversation>
  implements IConversationRepository
{
  constructor() {
    super(Conversation);
  }

  async findByParticipants(
    userId: Types.ObjectId,
    photographerId: Types.ObjectId
  ): Promise<IConversation | null> {
    return await Conversation.findOne({
      $or: [
        { userId, photographerId },
        { userId: photographerId, photographerId: userId },
      ],
    })
      .populate("userId", "name email role phone")
      .populate("photographerId", "name email role phone");
  }

  async findByUserId(
    userId: Types.ObjectId
  ): Promise<IConversation[]> {
    return await Conversation.find({ userId })
      .populate("userId", "name email role phone")
      .populate("photographerId", "name email role phone")
      .sort({ lastMessageAt: -1, updatedAt: -1, _id: -1 });
  }

  async findByPhotographerId(
    photographerId: Types.ObjectId
  ): Promise<IConversation[]> {
    return await Conversation.find({ photographerId })
      .populate("userId", "name email role phone")
      .populate("photographerId", "name email role phone")
      .sort({ lastMessageAt: -1, updatedAt: -1, _id: -1 });
  }

  async findByAnyParticipant(
    userId: Types.ObjectId
  ): Promise<IConversation[]> {
    return await Conversation.find({
      $or: [{ userId }, { photographerId: userId }],
    })
      .populate("userId", "name email role phone")
      .populate("photographerId", "name email role phone")
      .sort({ lastMessageAt: -1, updatedAt: -1, _id: -1 });
  }

  async updateLastMessage(
    conversationId: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<IConversation | null> {
    if (!Types.ObjectId.isValid(conversationId)) {
      return null;
    }

    return await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          lastMessage,
          lastMessageAt,
        },
      },
      { new: true }
    )
      .populate("userId", "name email role phone")
      .populate("photographerId", "name email role phone");
  }
}

export default ConversationRepository;

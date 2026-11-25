import { Types } from "mongoose";
import type { IConversation } from "../../../shared/interfaces/IConversation";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IConversationRepository } from "../interfaces/IConversationRepository";
import Conversation from "../../../shared/models/conversation.model";

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
      userId,
      photographerId,
    });
  }

  async findByUserId(
    userId: Types.ObjectId
  ): Promise<IConversation[]> {
    return await Conversation.find({ userId })
      .sort({ lastMessageAt: -1, _id: -1 });
  }

  async findByPhotographerId(
    photographerId: Types.ObjectId
  ): Promise<IConversation[]> {
    return await Conversation.find({ photographerId })
      .sort({ lastMessageAt: -1, _id: -1 });
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
    );
  }
}

export default ConversationRepository;
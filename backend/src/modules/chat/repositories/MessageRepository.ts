import { Types } from "mongoose";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import type { IMessageRepository } from "../interfaces/IMessageRepository.js";
import type { IMessage } from "../../../shared/interfaces/IMessage.js";
import Message from "../../../shared/models/message.model.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";


class MessageRepository
  extends BaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(Message);
  }

  async findByConversationId(
    conversationId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<IMessage[]> {
  
    const query = Message.find({ conversationId });
  
    if (cursor) {
      if (!Types.ObjectId.isValid(cursor)) {
        throw new AppError(HttpStatus.BAD_REQUEST,'Invalid cursor');
      }
  
      const cursorMessage = await Message.findOne({
        _id: new Types.ObjectId(cursor),
        conversationId,
      }).select("createdAt");
  
      if (!cursorMessage) return [];
  
      query.or([
        { createdAt: { $lt: cursorMessage.createdAt } },
        {
          createdAt: cursorMessage.createdAt,
          _id: { $lt: new Types.ObjectId(cursor) },
        },
      ]);
    }
  
    return query
      .sort({ createdAt: -1, _id: -1 })
      .limit(Math.max(1, Math.min(limit, 100)));
  }

  async markAsRead(
    conversationId: Types.ObjectId,
    readerId: Types.ObjectId
  ): Promise<void> {
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: readerId },
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  }

  async findUnreadCount(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<number> {
    return await Message.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    });
  }
}

export default MessageRepository;

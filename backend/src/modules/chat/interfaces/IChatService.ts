import type { IMessage, MessageType } from "../../../shared/interfaces/IMessage.js";
import type { ConversationResponseDto } from "../dtos/chat.dto.js";

export interface IChatService {
  getOrCreateConversation(
    initiatorId: string,
    targetUserId: string
  ): Promise<ConversationResponseDto>;

  getUserConversations(
    userId: string
  ): Promise<ConversationResponseDto[]>;

  getPhotographerConversations(
    photographerId: string
  ): Promise<ConversationResponseDto[]>;

  getAllConversationsForUser(
    userId: string
  ): Promise<ConversationResponseDto[]>;

  getMessages(
    conversationId: string,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<{ messages: IMessage[]; nextCursor: string | null; hasMore: boolean }>;

  sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type?: MessageType
  ): Promise<IMessage>;

  markMessagesAsRead(
    conversationId: string,
    readerId: string
  ): Promise<void>;
}

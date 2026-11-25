
import type { IConversation } from "../../../shared/interfaces/IConversation";
import type { IMessage, MessageType } from "../../../shared/interfaces/IMessage";

export interface IChatService {
  getOrCreateConversation(
    customerId: string,
    photographerId: string
  ): Promise<IConversation>;

  getUserConversations(
    userId: string
  ): Promise<IConversation[]>;

  getPhotographerConversations(
    photographerId: string
  ): Promise<IConversation[]>;

  getMessages(
    conversationId: string,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<IMessage[]>;

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

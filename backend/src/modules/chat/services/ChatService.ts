import { Types } from "mongoose";
import { AUTH_MESSAGES, CONVERSATION_MESSAGES } from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { IChatService } from "../interfaces/IChatService";
import type { IConversationRepository } from "../interfaces/IConversationRepository";
import type { IMessageRepository } from "../interfaces/IMessageRepository";
import type { IConversation } from "../../../shared/interfaces/IConversation";
import  { type IMessage, MessageType } from "../../../shared/interfaces/IMessage";
import { getIO } from "../../../shared/config/socket";


export class ChatService implements IChatService{
    constructor(
        private readonly _conversationRepository : IConversationRepository,
        private readonly _messageRepository : IMessageRepository
    ){}

    async getOrCreateConversation(
        customerId: string,
        photographerId: string
      ):Promise<IConversation> {
        
        if(customerId === photographerId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED)
        };

        let existingConversation = await this._conversationRepository.findByParticipants(new Types.ObjectId(customerId), new Types.ObjectId(photographerId));

        if(!existingConversation){
            const conversation = await this._conversationRepository.create({
                userId: new Types.ObjectId(customerId),
                photographerId: new Types.ObjectId(photographerId),
              });
            
              existingConversation = conversation
        }

        if(!existingConversation){
            throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.NOT_FOUND)
        }

        return existingConversation;
      }
    
      async getUserConversations(userId: string):Promise<IConversation[]> {
        const conversation = await this._conversationRepository.findByUserId(new Types.ObjectId(userId));

        if(!conversation){
            throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.NOT_FOUND);
        };

        return conversation;

      }
    
      async getPhotographerConversations(photographerId: string) {
        const conversation = await this._conversationRepository.findByPhotographerId(new Types.ObjectId(photographerId))

        if(!conversation){
            throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.NOT_FOUND);
        };

        return conversation;
      }
    

      async getMessages(
        conversationId: string,
        userId: string,
        limit: number,
        cursor?: string
      ): Promise<IMessage[]> {
      
        if (
          !Types.ObjectId.isValid(conversationId) ||
          !Types.ObjectId.isValid(userId)
        ) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.INVALID_ID);
        }
      
        const conversation =
          await this._conversationRepository.findById(conversationId);
      
        if (!conversation) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.NOT_FOUND);
        }
      
        const isParticipant =
          conversation.userId.toString() === userId ||
          conversation.photographerId.toString() === userId;
      
        if (!isParticipant) {
          throw new AppError(
            HttpStatus.UNAUTHORIZED,
            AUTH_MESSAGES.UNAUTHORIZED
          );
        }
      
        return await this._messageRepository.findByConversationId(
          new Types.ObjectId(conversationId),
          Math.max(1, Math.min(limit || 20, 100)),
          cursor
        );
      }
      
    

      async sendMessage(
        conversationId: string,
        senderId: string,
        content: string,
        type: MessageType = MessageType.TEXT
      ): Promise<IMessage> {
      
        if (
          !Types.ObjectId.isValid(conversationId) ||
          !Types.ObjectId.isValid(senderId)
        ) {
            throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.INVALID_ID);
        }
      
        const trimmedContent = content.trim();
      
        if (!trimmedContent) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.EMPTY_MESSAGE);
        }
      
        if (trimmedContent.length > 5000) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.LONG_MESSAGE);
        }
      
        const conversation =
          await this._conversationRepository.findById(conversationId);
      
        if (!conversation) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.NOT_FOUND);
        }
      
        const isParticipant =
          conversation.userId.toString() === senderId ||
          conversation.photographerId.toString() === senderId;
      
        if (!isParticipant) {
          throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }
      
        const message = await this._messageRepository.create({
          conversationId: new Types.ObjectId(conversationId),
          senderId: new Types.ObjectId(senderId),
          content: trimmedContent,
          type,
          isRead: false,
        });
      
        await this._conversationRepository.updateLastMessage(
          conversationId,
          trimmedContent,
          message.createdAt
        );
      
        getIO()
          .to(`conversation:${conversationId}`)
          .emit("message:new", message);
      
        return message;
      }
      
    

      async markMessagesAsRead(
        conversationId: string,
        readerId: string
      ): Promise<void> {
      
        if (
          !Types.ObjectId.isValid(conversationId) ||
          !Types.ObjectId.isValid(readerId)
        ) {
          throw new AppError(HttpStatus.BAD_REQUEST,CONVERSATION_MESSAGES.INVALID_ID);
        }
      
        const conversation =
          await this._conversationRepository.findById(conversationId);
      
        if (!conversation) {
          throw new AppError(HttpStatus.NOT_FOUND,CONVERSATION_MESSAGES.NOT_FOUND);
        }
      
        const isCustomer =
          conversation.userId.toString() === readerId;
      
        const isPhotographer =
          conversation.photographerId.toString() === readerId;
      
        if (!isCustomer && !isPhotographer) {
          throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }
      
        await this._messageRepository.markAsRead(
          new Types.ObjectId(conversationId),
          new Types.ObjectId(readerId)
        );
      
        const recipientId = isCustomer
          ? conversation.photographerId.toString()
          : conversation.userId.toString();
      
        getIO()
          .to(`user:${recipientId}`)
          .emit("message:read", {
            conversationId,
            readerId,
            readAt: new Date(),
          });
      }
      
    }
    
    export default ChatService;
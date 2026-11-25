import { Types } from "mongoose";
import { AUTH_MESSAGES, CONVERSATION_MESSAGES } from "../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IChatService } from "../interfaces/IChatService.js";
import type { IConversationRepository } from "../interfaces/IConversationRepository.js";
import type { IMessageRepository } from "../interfaces/IMessageRepository.js";
import type { IConversation } from "../../../shared/interfaces/IConversation.js";
import { type IMessage, MessageType } from "../../../shared/interfaces/IMessage.js";
import { getIO } from "../../../shared/config/socket.js";
import Users from "../../../shared/models/users.model.js";
import { userRole } from "../../../shared/enums/UserRole.js";
import type { ConversationResponseDto, ParticipantSummary } from "../dtos/chat.dto.js";

export class ChatService implements IChatService {
  constructor(
    private readonly _conversationRepository: IConversationRepository,
    private readonly _messageRepository: IMessageRepository
  ) {}

  private async mapConversationDto(
    conversation: IConversation,
    currentUserId: string
  ): Promise<ConversationResponseDto> {
    const unreadCount = await this._messageRepository.findUnreadCount(
      conversation._id,
      new Types.ObjectId(currentUserId)
    );

    const userObj = conversation.userId as unknown as ParticipantSummary;
    const photoObj = conversation.photographerId as unknown as ParticipantSummary;

    const isUserCaller =
      userObj?._id?.toString?.() === currentUserId ||
      conversation.userId?.toString?.() === currentUserId;

    const otherParticipant: ParticipantSummary = isUserCaller ? photoObj : userObj;

    return {
      _id: conversation._id.toString(),
      userId: userObj,
      photographerId: photoObj,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
      otherParticipant,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getOrCreateConversation(
    initiatorId: string,
    targetUserId: string
  ): Promise<ConversationResponseDto> {
    if (initiatorId === targetUserId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "Cannot create conversation with yourself"
      );
    }

    if (
      !Types.ObjectId.isValid(initiatorId) ||
      !Types.ObjectId.isValid(targetUserId)
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const initiatorObjectId = new Types.ObjectId(initiatorId);
    const targetObjectId = new Types.ObjectId(targetUserId);

    let existing = await this._conversationRepository.findByParticipants(
      initiatorObjectId,
      targetObjectId
    );

    if (!existing) {
      const [initiatorUser, targetUser] = await Promise.all([
        Users.findById(initiatorObjectId).select("role"),
        Users.findById(targetObjectId).select("role"),
      ]);

      if (!targetUser) {
        throw new AppError(HttpStatus.NOT_FOUND, "Target participant not found");
      }

      let userId = initiatorObjectId;
      let photographerId = targetObjectId;

      if (
        initiatorUser?.role === userRole.PHOTOGRAPHER &&
        targetUser?.role !== userRole.PHOTOGRAPHER
      ) {
        userId = targetObjectId;
        photographerId = initiatorObjectId;
      }

      const created = await this._conversationRepository.create({
        userId,
        photographerId,
      });

      existing = await this._conversationRepository.findById(
        created._id.toString()
      );
    }

    if (!existing) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.NOT_FOUND);
    }

    return await this.mapConversationDto(existing, initiatorId);
  }

  async getUserConversations(
    userId: string
  ): Promise<ConversationResponseDto[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const conversations = await this._conversationRepository.findByUserId(
      new Types.ObjectId(userId)
    );

    return await Promise.all(
      conversations.map((conv) => this.mapConversationDto(conv, userId))
    );
  }

  async getPhotographerConversations(
    photographerId: string
  ): Promise<ConversationResponseDto[]> {
    if (!Types.ObjectId.isValid(photographerId)) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const conversations =
      await this._conversationRepository.findByPhotographerId(
        new Types.ObjectId(photographerId)
      );

    return await Promise.all(
      conversations.map((conv) => this.mapConversationDto(conv, photographerId))
    );
  }

  async getAllConversationsForUser(
    userId: string
  ): Promise<ConversationResponseDto[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const conversations =
      await this._conversationRepository.findByAnyParticipant(
        new Types.ObjectId(userId)
      );

    return await Promise.all(
      conversations.map((conv) => this.mapConversationDto(conv, userId))
    );
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<{ messages: IMessage[]; nextCursor: string | null; hasMore: boolean }> {
    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const conversation =
      await this._conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.NOT_FOUND);
    }

    const userIdStr = (conversation.userId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.userId as { _id: Types.ObjectId })._id.toString()
      : conversation.userId.toString();

    const photographerIdStr = (conversation.photographerId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.photographerId as { _id: Types.ObjectId })._id.toString()
      : conversation.photographerId.toString();

    const isParticipant =
      userIdStr === userId || photographerIdStr === userId;

    if (!isParticipant) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const effectiveLimit = Math.max(1, Math.min(limit || 20, 100));

    // Request one extra message to determine if there is a next cursor
    const messages = await this._messageRepository.findByConversationId(
      new Types.ObjectId(conversationId),
      effectiveLimit + 1,
      cursor
    );

    const hasMore = messages.length > effectiveLimit;
    const paginatedMessages = hasMore
      ? messages.slice(0, effectiveLimit)
      : messages;

    const lastItem =
      paginatedMessages.length > 0
        ? paginatedMessages[paginatedMessages.length - 1]
        : undefined;

    const nextCursor =
      hasMore && lastItem ? lastItem._id.toString() : null;

    return {
      messages: paginatedMessages,
      nextCursor,
      hasMore,
    };
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
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        CONVERSATION_MESSAGES.EMPTY_MESSAGE
      );
    }

    if (trimmedContent.length > 5000) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        CONVERSATION_MESSAGES.LONG_MESSAGE
      );
    }

    const conversation =
      await this._conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.NOT_FOUND);
    }

    const userIdStr = (conversation.userId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.userId as { _id: Types.ObjectId })._id.toString()
      : conversation.userId.toString();

    const photographerIdStr = (conversation.photographerId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.photographerId as { _id: Types.ObjectId })._id.toString()
      : conversation.photographerId.toString();

    const isParticipant =
      userIdStr === senderId || photographerIdStr === senderId;

    if (!isParticipant) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
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

    const recipientId =
      userIdStr === senderId ? photographerIdStr : userIdStr;

    try {
      const io = getIO();
      io.to(`conversation:${conversationId}`).emit("message:new", message);
      io.to(`user:${recipientId}`).emit("conversation:updated", {
        conversationId,
        lastMessage: trimmedContent,
        lastMessageAt: message.createdAt,
        senderId,
      });
    } catch (socketError) {
      console.warn("Socket notification warning:", socketError);
    }

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
      throw new AppError(HttpStatus.BAD_REQUEST, CONVERSATION_MESSAGES.INVALID_ID);
    }

    const conversation =
      await this._conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError(HttpStatus.NOT_FOUND, CONVERSATION_MESSAGES.NOT_FOUND);
    }

    const userIdStr = (conversation.userId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.userId as { _id: Types.ObjectId })._id.toString()
      : conversation.userId.toString();

    const photographerIdStr = (conversation.photographerId as { _id?: Types.ObjectId } | Types.ObjectId)?._id
      ? (conversation.photographerId as { _id: Types.ObjectId })._id.toString()
      : conversation.photographerId.toString();

    const isParticipant =
      userIdStr === readerId || photographerIdStr === readerId;

    if (!isParticipant) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await this._messageRepository.markAsRead(
      new Types.ObjectId(conversationId),
      new Types.ObjectId(readerId)
    );

    const recipientId =
      userIdStr === readerId ? photographerIdStr : userIdStr;

    try {
      const io = getIO();
      const readPayload = {
        conversationId,
        readerId,
        readAt: new Date(),
      };
      io.to(`conversation:${conversationId}`).emit("message:read", readPayload);
      io.to(`user:${recipientId}`).emit("message:read", readPayload);
    } catch (socketError) {
      console.warn("Socket notification warning:", socketError);
    }
  }
}

export default ChatService;

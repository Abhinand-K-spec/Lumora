
import type { Request, Response } from "express";
import type { IChatService } from "../interfaces/IChatService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { AUTH_MESSAGES, CONVERSATION_MESSAGES } from "../../../shared/constants/message.constant.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";

export class ChatController {
  constructor(
    private readonly _chatService: IChatService
  ) {}

  async createConversation(
    req: Request,
    res: Response
  ): Promise<void> {
    const customerId = req.user?.id;

    if (!customerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const { photographerUserId } = req.body;

    const result = await this._chatService.getOrCreateConversation(
      customerId,
      photographerUserId
    );

    sendSuccess(res, result, "Conversation retrieved successfully");
  }

  async getUserConversations(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const result = await this._chatService.getUserConversations(userId);

    sendSuccess(res, result, "Conversations fetched successfully");
  }

  async getPhotographerConversations(
    req: Request,
    res: Response
  ): Promise<void> {
    const photographerId = req.user?.id;

    if (!photographerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const result =
      await this._chatService.getPhotographerConversations(photographerId);

    sendSuccess(res, result, "Conversations fetched successfully");
  }

  async getMessages(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const { conversationId } = req.params;
    if (typeof conversationId !== "string") {
        throw new AppError(
            HttpStatus.BAD_REQUEST,
            CONVERSATION_MESSAGES.INVALID_ID
        );
    }

    const limit = Number(req.query.limit) || 20;

    const cursor =
      typeof req.query.cursor === "string"
        ? req.query.cursor
        : undefined;

    const result = await this._chatService.getMessages(
      conversationId,
      userId,
      limit,
      cursor
    );

    sendSuccess(res, result, "Messages fetched successfully");
  }


  async sendMessage(
    req: Request,
    res: Response
  ): Promise<void> {
    const senderId = req.user?.id;

    if (!senderId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const { conversationId } = req.params;
    const { content, type } = req.body;


    if (typeof conversationId !== "string") {
    throw new AppError(
        HttpStatus.BAD_REQUEST,
        CONVERSATION_MESSAGES.INVALID_ID
    );
    }

    const result = await this._chatService.sendMessage(
      conversationId,
      senderId,
      content,
      type
    );

    sendSuccess(res, result, "Message sent successfully");
  }

  async markMessagesAsRead(
    req: Request,
    res: Response
  ): Promise<void> {
    const readerId = req.user?.id;

    if (!readerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const { conversationId } = req.params;

    if (typeof conversationId !== "string") {
        throw new AppError(
            HttpStatus.BAD_REQUEST,
            CONVERSATION_MESSAGES.INVALID_ID
        );
    }

    await this._chatService.markMessagesAsRead(
      conversationId,
      readerId
    );

    sendSuccess(res, null, "Messages marked as read");
  }
}

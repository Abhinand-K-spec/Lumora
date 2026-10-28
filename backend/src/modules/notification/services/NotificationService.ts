import { Types } from "mongoose";
import type { INotification } from "../../../shared/interfaces/INotification";
import type { INotificationService } from "../interfaces/INotificationService";
import type { INotificationRepository } from "../interfaces/INotificationRepository";
import type { ICreateNotificationInput } from "../interfaces/ICreateNotificationInput";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant";




export class NotificationService implements INotificationService{
    constructor(private readonly _notificationRepository:INotificationRepository){}
    
async createNotification(
    input: ICreateNotificationInput
  ): Promise<INotification> {
    if (!Types.ObjectId.isValid(input.recipientId)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }
  
    const notificationData: Partial<INotification> = {
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      readAt: null,
  
      ...(input.actorId !== undefined && {
        actorId: input.actorId,
      }),
  
      ...(input.resourceType !== undefined && {
        resourceType: input.resourceType,
      }),
  
      ...(input.resourceId !== undefined && {
        resourceId: input.resourceId,
      }),
    };
  
    return this._notificationRepository.create(notificationData);
  }


  async getNotifications(recipientId: Types.ObjectId, page: number, limit: number): Promise<{notifications:INotification[],total:number,unreadCount:number}> {
      if(!Number.isInteger(page) || page<1){
        throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
      if(!Number.isInteger(limit) || limit > 100){
        throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.INVALID_CREDENTIALS);
      }

      const [result, unreadCount] = await Promise.all([this._notificationRepository.findByRecipientId(recipientId,page,limit),this._notificationRepository.countUnread(recipientId)]);
      return {notifications:result.notifications,total:result.total,unreadCount};
  }


  async getUnreadCount(recipientId: Types.ObjectId): Promise<number> {
      if(!recipientId){
        throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
      }

      return await this._notificationRepository.countUnread(recipientId);
  }

  async markAsRead(notificationId: string, recipientId: Types.ObjectId): Promise<INotification> {
      if(!notificationId){
        throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.INVALID_CREDENTIALS)
      }

      if(!recipientId){
        throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
      }

      const notification = await this._notificationRepository.markAsRead(notificationId,recipientId);
      if(!notification){
        throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.FORBIDDEN);
      }
      return notification;
  }

  async markAllAsRead(recipientId: Types.ObjectId): Promise<number> {
      if(!recipientId){
        throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
      };
      return await this._notificationRepository.markAllAsRead(recipientId);
  }
  
}
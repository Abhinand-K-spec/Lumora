import type { Request, Response } from "express";
import type { INotificationService } from "../interfaces/INotificationService";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AUTH_MESSAGES, NOTIFICATION_MESSAGES } from "../../../shared/constants/message.constant";
import { Types } from "mongoose";
import { sendSuccess } from "../../../shared/utils/response.utils";

export class NotificationController{
    constructor(private readonly _notificationService:INotificationService){};

    async getNotifications(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        }
        const page = req.query?.page || 1;
        const limit = req.query?.limit || 20;

        const result = await this._notificationService.getNotifications(
            new Types.ObjectId(userId),
            Number(page),
            Number(limit)
        )
        sendSuccess(res,result,NOTIFICATION_MESSAGES.GENERAL.NOTIFICATIONS_FETCHED)
    }

    async getUnreadCount(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };

        const unreadCount = await this._notificationService.getUnreadCount(new Types.ObjectId(userId));
        sendSuccess(res,unreadCount,NOTIFICATION_MESSAGES.GENERAL.UNREAD_COUNT_FETCHED);
    }

    async markAsRead(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        const notificationId = req.params?.id;

        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };

        if(!notificationId || typeof notificationId !== "string"){
            throw new AppError(HttpStatus.BAD_REQUEST,AUTH_MESSAGES.FORBIDDEN)
        }
        const notification = await this._notificationService.markAsRead(notificationId,new Types.ObjectId(userId))

        sendSuccess(res,notification,NOTIFICATION_MESSAGES.GENERAL.NOTIFICATION_READ);
    }


    async markAllAsRead(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };

        const modifiedCount = await this._notificationService.markAllAsRead(new Types.ObjectId(userId));
        sendSuccess(res,modifiedCount,NOTIFICATION_MESSAGES.GENERAL.ALL_NOTIFICATION_READ);
    }
}
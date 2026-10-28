import type { Types } from "mongoose";
import type { INotification } from "../../../shared/interfaces/INotification";
import type { ICreateNotificationInput } from "./ICreateNotificationInput";




export interface INotificationService{
    createNotification(input:ICreateNotificationInput):Promise<INotification>;
    getNotifications(recipientId:Types.ObjectId,page:number,limit:number):Promise<{notifications:INotification[],total:number,unreadCount:number}>;
    getUnreadCount(recipientId:Types.ObjectId):Promise<number>;
    markAsRead(notificationId:string,recipientId:Types.ObjectId):Promise<INotification>;
    markAllAsRead(recipientId:Types.ObjectId):Promise<number>;
}
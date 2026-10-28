import type { Types } from "mongoose";
import type { INotification } from "../../../shared/interfaces/INotification";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";


export interface NotificationPagination{
    page:number;
    limit:number;
}


export interface NotificationPage{
    notifications:INotification[];
    total:number;
}



export interface INotificationRepository extends IBaseRepository<INotification>{
    findByRecipientId(recipientId:Types.ObjectId,page:number,limit:number):Promise<{notifications:INotification[],total:number}>;
    countUnread(recipientId:Types.ObjectId):Promise<number>;
    markAsRead(notificationId:string,recipientId:Types.ObjectId):Promise<INotification|null>;
    markAllAsRead(recipientId:Types.ObjectId):Promise<number>;
}
import type { Types } from "mongoose";
import type { INotification } from "../../../shared/interfaces/INotification";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { INotificationRepository } from "../interfaces/INotificationRepository";
import { NotificationModel } from "../../../shared/models/notification.model";

export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  async findByRecipientId(
    recipientId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this._model
        .find({recipientId})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments({ recipientId }).exec(),
    ]);

    return {
      notifications,
      total,
    };
  }

  async countUnread(recipientId: Types.ObjectId): Promise<number> {
      return await this._model.countDocuments({recipientId,isRead:false}).exec();
  }

  async markAsRead(notificationId: string, recipientId: Types.ObjectId): Promise<INotification | null> {
      return await this._model.findOneAndUpdate({_id:notificationId,recipientId,isRead:false},{$set:{isRead:true,readAt:new Date()}},{new:true}).exec()
  }

  async markAllAsRead(recipientId: Types.ObjectId): Promise<number> {
      const result= await this._model.updateMany({recipientId,isRead:false},{$set:{isRead:true,readAt:new Date()}}).exec()
      return result.modifiedCount
  }
}

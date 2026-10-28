import type { Types } from "mongoose";
import type { INotification } from "../../../shared/interfaces/INotification";

export interface ICreateNotificationInput {
    recipientId: Types.ObjectId;
    actorId?: Types.ObjectId;
    type: INotification["type"];
    title: string;
    message: string;
    resourceType?: INotification["resourceType"];
    resourceId?: Types.ObjectId;
  }
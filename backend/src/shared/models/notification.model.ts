import { Schema, model } from "mongoose";

import type {
  INotification,
} from "../interfaces/INotification";

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    actorId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "BOOKING_CREATED",
        "BOOKING_ACCEPTED",
        "BOOKING_REJECTED",
        "BOOKING_CANCELLED",
        "QUOTATION_RECEIVED",
        "QUOTATION_ACCEPTED",
        "QUOTATION_REJECTED",
        "POST_LIKED",
        "POST_COMMENTED",
        "PROFILE_APPROVED",
        "PROFILE_REJECTED",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    resourceType: {
      type: String,
      enum: ["BOOKING", "QUOTATION", "POST", "PROFILE"],
    },

    resourceId: {
      type: Schema.Types.ObjectId,
    },

    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipientId: 1,
  isRead: 1,
});

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
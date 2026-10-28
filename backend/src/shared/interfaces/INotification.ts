import type { Types } from "mongoose";

export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_ACCEPTED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "QUOTATION_RECEIVED"
  | "QUOTATION_ACCEPTED"
  | "QUOTATION_REJECTED"
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "PROFILE_APPROVED"
  | "PROFILE_REJECTED";

export type NotificationResourceType =
  | "BOOKING"
  | "QUOTATION"
  | "POST"
  | "PROFILE";

export interface INotification {
  recipientId: Types.ObjectId;

  actorId?: Types.ObjectId;

  type: NotificationType;

  title: string;

  message: string;

  resourceType?: NotificationResourceType;

  resourceId?: Types.ObjectId;

  isRead: boolean;

  readAt?: Date | null;

  createdAt?: Date;

  updatedAt?: Date;
}
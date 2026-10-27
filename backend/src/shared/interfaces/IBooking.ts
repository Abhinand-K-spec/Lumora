import type { Types } from "mongoose";

export type BookingStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface IBooking {
  userId: Types.ObjectId;
  photographerId: Types.ObjectId;
  packageId?: Types.ObjectId | undefined;
  eventType: string;
  eventDate: Date;
  location?: string | undefined;
  notes?: string | undefined;
  totalPrice?: number | undefined;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

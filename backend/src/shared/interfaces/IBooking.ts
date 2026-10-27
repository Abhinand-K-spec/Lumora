import type { Types } from "mongoose";

export type BookingStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface IBooking {
  userId: Types.ObjectId;
  photographerId: Types.ObjectId;
  packageId?: Types.ObjectId;
  eventType: string;
  eventDate: Date;
  location?: string;
  notes?: string;
  totalPrice?: number;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

import type { Types } from "mongoose";

export type BookingStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";


export interface IBookingSubEvent {
  eventType: string;
  eventDate: Date;
  location?: string | undefined;
}

export interface IBooking {
  userId: Types.ObjectId;
  photographerId: Types.ObjectId;
  packageId?: Types.ObjectId | undefined;
  events: IBookingSubEvent[];
  notes?: string | undefined;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

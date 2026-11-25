import type { Types } from "mongoose";

export interface IEventProgram {
  name: string;
  date: Date;
  location?: string;
  coordinates?: [number, number];
}

export type EventStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface IEvent {
  _id?: Types.ObjectId;

  bookingId: Types.ObjectId;
  photographerId: Types.ObjectId;
  userId: Types.ObjectId;

  name: string;
  description?: string;

  coverImage?: string;

  programs: IEventProgram[];

  publicId: string;

  status: EventStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
import { Types } from "mongoose";

export type AvailabilityType = "BLOCKED";

export interface IAvailability {
  _id?: Types.ObjectId;

  photographerId: Types.ObjectId;

  startDate: Date;

  endDate: Date;

  type: AvailabilityType;

  reason?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}
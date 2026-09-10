import { Types } from "mongoose";

export type PhotographerApprovalStatus =
  "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface IPhotographer {
  _id: Types.ObjectId;
  userId: string;
  bio: string;
  profilePhoto?: string;
  coverPhoto?: string;
  location?: string;
  languages?: string[];
  specialities?: string[];
  equipment?: string[];
  serviceRegions?: string[];
  updatedAt: Date;
  createdAt: Date;
  phone: string;
  startingPrice?: number;
  instagramUrl?: string;
  approvalStatus: PhotographerApprovalStatus;
  approvedAt?: Date;
  rejectionReason?: string;
}

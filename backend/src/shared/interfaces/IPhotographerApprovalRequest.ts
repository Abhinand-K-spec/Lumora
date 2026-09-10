import { Types } from "mongoose";
import type { IPackage } from "./IPackage.js";

export type ApprovalRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PopulatedUserData {
  _id?: Types.ObjectId | string;
  name?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface PopulatedPhotographerData {
  _id: Types.ObjectId | string;
  userId: string;
  bio?: string;
  phone?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  location?: string;
  languages?: string[];
  specialities?: string[];
  equipment?: string[];
  serviceRegions?: string[];
  instagramUrl?: string;
  approvalStatus: string;
  startingPrice?: number;
  user?: PopulatedUserData | null;
  packages?: IPackage[];
}

export interface IPhotographerApprovalRequest {
  _id: Types.ObjectId;
  photographerId: Types.ObjectId;
  status: ApprovalRequestStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?:
    | Types.ObjectId
    | { _id: Types.ObjectId | string; name?: string; email?: string };
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  photographer?: PopulatedPhotographerData | null;
}

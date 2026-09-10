import { Types } from "mongoose";
import type {
  IPhotographerApprovalRequest,
  ApprovalRequestStatus,
} from "../../../shared/interfaces/IPhotographerApprovalRequest.js";

export interface ApprovalActivityItem {
  _id: Types.ObjectId | string;
  photographerId: Types.ObjectId | string;
  status: ApprovalRequestStatus;
  photographerName: string;
  avatarUrl: string;
  reviewerName: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface ApprovalMetrics {
  pendingCount: number;
  totalReviewed: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  recentlyApproved: ApprovalActivityItem[];
  recentlyRejected: ApprovalActivityItem[];
}

export interface IPhotographerApprovalRequestRepository {
  create(
    data: Partial<IPhotographerApprovalRequest>,
  ): Promise<IPhotographerApprovalRequest>;
  findById(id: string): Promise<IPhotographerApprovalRequest | null>;
  findPendingByPhotographerId(
    photographerId: string,
  ): Promise<IPhotographerApprovalRequest | null>;
  findByPhotographerId(
    photographerId: string,
  ): Promise<IPhotographerApprovalRequest[]>;
  findAllPaginated(
    filter: Record<string, unknown>,
    skip: number,
    limit: number,
    sort?: Record<string, 1 | -1>,
  ): Promise<[IPhotographerApprovalRequest[], number]>;
  updateStatus(
    id: string,
    status: ApprovalRequestStatus,
    adminId: string,
    rejectionReason?: string,
  ): Promise<IPhotographerApprovalRequest | null>;
  getMetrics(): Promise<ApprovalMetrics>;
}

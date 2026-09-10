import type { IPhotographerApprovalRequest } from "../../../../shared/interfaces/IPhotographerApprovalRequest.js";
import type { ApprovalMetrics } from "../../../photographer/repositories/IPhotographerApprovalRequestRepository.js";
import type { PaginatedResult } from "../../../../shared/types/pagination.types.js";

export interface IAdminPhotographerService {
  getApprovalRequests(
    filter: { status?: string },
    pagination: { page: number; limit: number },
  ): Promise<PaginatedResult<IPhotographerApprovalRequest>>;

  getMetrics(): Promise<ApprovalMetrics>;

  reviewRequest(
    requestId: string,
    adminId: string,
    decision: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ): Promise<IPhotographerApprovalRequest>;
}

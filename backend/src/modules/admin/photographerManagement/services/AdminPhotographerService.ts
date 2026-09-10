import {
  APPROVAL_MESSAGES,
  PHOTOGRAPHER_MESSAGES,
} from "../../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../../shared/errors/AppError.js";
import type { IPhotographerApprovalRequest } from "../../../../shared/interfaces/IPhotographerApprovalRequest.js";
import type { IPhotographer } from "../../../../shared/interfaces/IPhotographer.js";
import type {
  IPhotographerApprovalRequestRepository,
  ApprovalMetrics,
} from "../../../photographer/repositories/IPhotographerApprovalRequestRepository.js";
import type { IPhotographerRepository } from "../../../photographer/repositories/IPhotographerRepository.js";
import type { PaginatedResult } from "../../../../shared/types/pagination.types.js";
import type { IAdminPhotographerService } from "../interfaces/IAdminPhotographerService.js";

export class AdminPhotographerService implements IAdminPhotographerService {
  constructor(
    private readonly _approvalRepo: IPhotographerApprovalRequestRepository,
    private readonly _photographerRepo: IPhotographerRepository,
  ) {}

  async getApprovalRequests(
    filter: { status?: string },
    pagination: { page: number; limit: number },
  ): Promise<PaginatedResult<IPhotographerApprovalRequest>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(50, pagination.limit || 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;

    const [items, total] = await this._approvalRepo.findAllPaginated(
      query,
      skip,
      limit,
      { submittedAt: -1 },
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getMetrics(): Promise<ApprovalMetrics> {
    return this._approvalRepo.getMetrics();
  }

  async reviewRequest(
    requestId: string,
    adminId: string,
    decision: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ): Promise<IPhotographerApprovalRequest> {
    if (!requestId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        APPROVAL_MESSAGES.REQUEST_ID_REQUIRED,
      );
    }

    if (decision.status === "REJECTED" && !decision.rejectionReason) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        APPROVAL_MESSAGES.REJECTION_REASON_REQUIRED,
      );
    }

    // Fetch the request to validate it exists and is PENDING
    const request = await this._approvalRepo.findById(requestId);
    if (!request) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        APPROVAL_MESSAGES.REQUEST_NOT_FOUND,
      );
    }
    if (request.status !== "PENDING") {
      throw new AppError(
        HttpStatus.CONFLICT,
        APPROVAL_MESSAGES.REQUEST_ALREADY_REVIEWED,
      );
    }

    // Update the approval request record
    const updated = await this._approvalRepo.updateStatus(
      requestId,
      decision.status,
      adminId,
      decision.rejectionReason,
    );

    if (!updated) {
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update request status.",
      );
    }

    // Mirror approval status on the Photographer document
    const baseUpdate: Partial<IPhotographer> = {
      approvalStatus: decision.status,
    };
    if (decision.status === "APPROVED") {
      baseUpdate.approvedAt = new Date();
    } else if (decision.rejectionReason) {
      baseUpdate.rejectionReason = decision.rejectionReason;
    }

    await this._photographerRepo.update(
      request.photographerId.toString(),
      baseUpdate,
    );

    return updated;
  }
}

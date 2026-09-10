import type { Request, Response } from "express";
import { AppError } from "../../../../shared/errors/AppError.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { sendSuccess } from "../../../../shared/utils/response.utils.js";
import {
  COMMON_MESSAGES,
  APPROVAL_MESSAGES,
} from "../../../../shared/constants/message.constant.js";
import type { IAdminPhotographerService } from "../interfaces/IAdminPhotographerService.js";

export class AdminPhotographerController {
  constructor(
    private readonly _adminPhotographerService: IAdminPhotographerService,
  ) {}

  async getApprovalRequests(req: Request, res: Response): Promise<void> {
    const { status, page, limit } = req.query;

    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit ? parseInt(String(limit), 10) : 10;

    const result = await this._adminPhotographerService.getApprovalRequests(
      { ...(status ? { status: String(status) } : {}) },
      {
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 10 : limitNum,
      },
    );

    sendSuccess(res, result, APPROVAL_MESSAGES.REQUESTS_FETCHED);
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    const metrics = await this._adminPhotographerService.getMetrics();
    sendSuccess(res, { metrics }, APPROVAL_MESSAGES.METRICS_FETCHED);
  }

  async reviewRequest(req: Request, res: Response): Promise<void> {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const { requestId } = req.params;
    if (!requestId || typeof requestId !== "string") {
      throw new AppError(HttpStatus.BAD_REQUEST, "Request ID is required.");
    }

    const { status, rejectionReason } = req.body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "Status must be APPROVED or REJECTED.",
      );
    }

    const reason: string | undefined =
      typeof rejectionReason === "string" ? rejectionReason : undefined;

    const updated = await this._adminPhotographerService.reviewRequest(
      requestId,
      adminId,
      {
        status: status as "APPROVED" | "REJECTED",
        ...(reason ? { rejectionReason: reason } : {}),
      },
    );

    const message =
      status === "APPROVED"
        ? APPROVAL_MESSAGES.REQUEST_APPROVED
        : APPROVAL_MESSAGES.REQUEST_REJECTED;

    sendSuccess(res, { request: updated }, message);
  }
}

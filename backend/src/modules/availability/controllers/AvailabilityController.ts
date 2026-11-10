import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { IAvailabilityService } from "../interfaces/IAvailabilityService";
import { sendSuccess } from "../../../shared/utils/response.utils";
import {
  AVAILABILITY_MESSAGES,
  AUTH_MESSAGES,
} from "../../../shared/constants/message.constant";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { getCalendarSchema } from "../../../shared/validators/availability.validator";

export class AvailabilityController {
  constructor(private readonly _availabilityService: IAvailabilityService) {}

  async getMyCalendar(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;
    if (!photographerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const parseResult = getCalendarSchema.safeParse(req.query);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues
        .map((i) => i.message)
        .join(", ");
      throw new AppError(HttpStatus.BAD_REQUEST, errorMsg);
    }

    const { month, year } = parseResult.data;
    const calendar = await this._availabilityService.getMonthlyCalendar(
      new Types.ObjectId(photographerId),
      month,
      year
    );

    sendSuccess(res, calendar, AVAILABILITY_MESSAGES.CALENDAR_FETCHED);
  }

  /**
   * GET /api/availability/calendar/:photographerId?month=11&year=2026
   * Public/client view to check a photographer's available dates
   */
  async getPhotographerCalendar(req: Request, res: Response): Promise<void> {
    const photographerId = req.params.photographerId?.toString();
    if (!photographerId || !Types.ObjectId.isValid(photographerId)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.PHOTOGRAPHER_ID_REQUIRED
      );
    }

    const parseResult = getCalendarSchema.safeParse(req.query);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues
        .map((i) => i.message)
        .join(", ");
      throw new AppError(HttpStatus.BAD_REQUEST, errorMsg);
    }

    const { month, year } = parseResult.data;
    const calendar = await this._availabilityService.getMonthlyCalendar(
      new Types.ObjectId(photographerId),
      month,
      year
    );

    sendSuccess(res, calendar, AVAILABILITY_MESSAGES.CALENDAR_FETCHED);
  }

  /**
   * POST /api/availability/block
   * Body: { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD", reason?: string }
   * For photographers to mark dates as blocked
   */
  async blockDates(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;
    if (!photographerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const blocked = await this._availabilityService.blockDates(
      new Types.ObjectId(photographerId),
      req.body
    );

    sendSuccess(res, blocked, AVAILABILITY_MESSAGES.DATES_BLOCKED);
  }

  /**
   * DELETE /api/availability/unblock/:availabilityId
   * For photographers to remove a blocked date range
   */
  async unblockDates(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;
    if (!photographerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const availabilityId = req.params.availabilityId?.toString();
    if (!availabilityId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.NOT_FOUND
      );
    }

    const success = await this._availabilityService.unblockDates(
      new Types.ObjectId(photographerId),
      availabilityId
    );

    sendSuccess(res, { success }, AVAILABILITY_MESSAGES.DATES_UNBLOCKED);
  }
}

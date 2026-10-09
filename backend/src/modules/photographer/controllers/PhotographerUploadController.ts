import type { Request, Response, NextFunction } from "express";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";

export class PhotographerUploadController {
  constructor(private readonly _r2StorageService: IR2StorageService) { }

  async createUploadUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const photographerId = req.user?.id;

    if (!photographerId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const { contentType, size } = req.body;

    const result = await this._r2StorageService.createUploadUrl({
      photographerId: String(photographerId),
      contentType,
      size,
    });

    sendSuccess(res, { data: result }, "Upload URL created", HttpStatus.OK);
  }
}

import type { Request, Response } from "express";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";
import type { IPhotographerRepository } from "../repositories/IPhotographerRepository.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import {
  COMMON_MESSAGES,
  PHOTOGRAPHER_MESSAGES,
} from "../../../shared/constants/message.constant.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class PhotographerUploadController {
  constructor(
    private readonly _r2StorageService: IR2StorageService,
    private readonly _photographerRepository: IPhotographerRepository,
  ) {}

  async createUploadUrl(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        COMMON_MESSAGES.USER_ID_REQUIRED,
      );
    }

    const photographer =
      await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        PHOTOGRAPHER_MESSAGES.PROFILE_NOT_FOUND,
      );
    }

    const { contentType, size } = req.body;

    const result = await this._r2StorageService.createUploadUrl({
      photographerId: photographer._id.toString(),
      contentType,
      size,
    });

    sendSuccess(res, result, "Upload URL created", HttpStatus.OK);
  }
}

import type { Request, Response } from "express";
import type { IFeedService } from "../interfaces/IFeedService.js";
import type { IPhotographerRepository } from "../../photographer/repositories/IPhotographerRepository.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import {
  COMMON_MESSAGES,
  FEED_MESSAGES,
  PHOTOGRAPHER_MESSAGES,
} from "../../../shared/constants/message.constant.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class FeedController {
  constructor(
    private readonly _feedService: IFeedService,
    private readonly _photographerRepository: IPhotographerRepository,
  ) {}

  async createPost(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        COMMON_MESSAGES.USER_ID_REQUIRED,
      );
    }

    const photographerProfile =
      await this._photographerRepository.findByUserId(userId);

    if (!photographerProfile) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        PHOTOGRAPHER_MESSAGES.PROFILE_NOT_FOUND,
      );
    }

    const { caption, mediaKeys } = req.body;

    const post = await this._feedService.createPost({
      photographerId: photographerProfile._id.toString(),
      caption,
      mediaKeys,
    });

    sendSuccess(res, post, FEED_MESSAGES.POSTED_SUCCESS, HttpStatus.CREATED);
  }
}
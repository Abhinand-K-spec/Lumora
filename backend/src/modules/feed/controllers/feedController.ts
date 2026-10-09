import type { Request, Response, NextFunction } from "express";
import type { IFeedService } from "../interfaces/IFeedService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES, FEED_MESSAGES } from "../../../shared/constants/message.constant.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";

export class FeedController {
  constructor(private readonly _feedService: IFeedService) { }

  async createPost(
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

    const { caption, mediaKeys } = req.body;

    const post = await this._feedService.createPost({
      photographerId: String(photographerId),
      caption,
      mediaKeys,
    });

    sendSuccess(res, { data: post }, FEED_MESSAGES.POSTED_SUCCESS, HttpStatus.CREATED);
  }
}
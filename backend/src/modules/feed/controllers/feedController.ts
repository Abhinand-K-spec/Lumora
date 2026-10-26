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

  async createPost(req: Request, res: Response): Promise<void> {
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

  async getFeed(req: Request, res: Response): Promise<void> {
    const limitQuery = req.query.limit;
    const limit =
      typeof limitQuery === "string" && !isNaN(parseInt(limitQuery, 10))
        ? parseInt(limitQuery, 10)
        : 10;

    let cursor: { createdAt: Date; id: string } | undefined = undefined;

    if (typeof req.query.cursor === "string" && req.query.cursor.trim()) {
      try {
        const decoded = JSON.parse(
          Buffer.from(req.query.cursor, "base64").toString("utf8"),
        );
        const parsedDate = new Date(decoded.createdAt);

        if (isNaN(parsedDate.getTime()) || !decoded.id) {
          throw new Error("Malformed cursor payload");
        }

        cursor = {
          createdAt: parsedDate,
          id: String(decoded.id),
        };
      } catch {
        throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_CURSOR);
      }
    } else if (req.query.cursorCreatedAt && req.query.cursorId) {
      const parsedDate = new Date(req.query.cursorCreatedAt as string);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_CURSOR);
      }
      cursor = {
        createdAt: parsedDate,
        id: String(req.query.cursorId),
      };
    }

    const photographerIdQuery = req.query.photographerId;
    let photographerId: string | undefined = undefined;
    if (typeof photographerIdQuery === "string" && photographerIdQuery.trim()) {
      const trimmed = photographerIdQuery.trim();
      const byUser = await this._photographerRepository.findByUserId(trimmed);
      photographerId = byUser ? byUser._id.toString() : trimmed;
    }

    const feedData = await this._feedService.getFeed({
      limit,
      cursor,
      photographerId,
    });

    sendSuccess(
      res,
      feedData,
      FEED_MESSAGES.FETCHED_SUCCESS,
      HttpStatus.OK,
    );
  }

  async getMyPosts(req: Request, res: Response): Promise<void> {
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

    const limitQuery = req.query.limit;
    const limit =
      typeof limitQuery === "string" && !isNaN(parseInt(limitQuery, 10))
        ? parseInt(limitQuery, 10)
        : 20;

    let cursor: { createdAt: Date; id: string } | undefined = undefined;

    if (typeof req.query.cursor === "string" && req.query.cursor.trim()) {
      try {
        const decoded = JSON.parse(
          Buffer.from(req.query.cursor, "base64").toString("utf8"),
        );
        const parsedDate = new Date(decoded.createdAt);

        if (isNaN(parsedDate.getTime()) || !decoded.id) {
          throw new Error("Malformed cursor payload");
        }

        cursor = {
          createdAt: parsedDate,
          id: String(decoded.id),
        };
      } catch {
        throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_CURSOR);
      }
    } else if (req.query.cursorCreatedAt && req.query.cursorId) {
      const parsedDate = new Date(req.query.cursorCreatedAt as string);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_CURSOR);
      }
      cursor = {
        createdAt: parsedDate,
        id: String(req.query.cursorId),
      };
    }

    const feedData = await this._feedService.getFeed({
      limit,
      cursor,
      photographerId: photographerProfile._id.toString(),
    });

    sendSuccess(
      res,
      feedData,
      FEED_MESSAGES.FETCHED_SUCCESS,
      HttpStatus.OK,
    );
  }

  async deletePost(req: Request, res: Response): Promise<void> {
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

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Post ID is required");
    }

    await this._feedService.deletePost(id, photographerProfile._id.toString());

    sendSuccess(res, null, "Post deleted successfully", HttpStatus.OK);
  }
}

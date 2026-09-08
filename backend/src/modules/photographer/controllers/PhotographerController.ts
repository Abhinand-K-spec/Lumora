import {
  COMMON_MESSAGES,
  PHOTOGRAPHER_MESSAGES,
} from "../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";
import type { IPhotographerService } from "../interfaces/IPhotographerService.js";
import type { Request, Response } from "express";

export class PhotographerController {
  constructor(private readonly _photographerService: IPhotographerService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const photographer = await this._photographerService.getProfile(userId);

    sendSuccess(res, { photographer }, PHOTOGRAPHER_MESSAGES.PROFILE_FETCHED);
  }

  async getPhotographerById(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    if (!userId) {
      throw new AppError(HttpStatus.BAD_REQUEST, COMMON_MESSAGES.USER_ID_REQUIRED);
    }

    const photographer = await this._photographerService.getProfile(
      userId.toString()
    );

    sendSuccess(res, { photographer }, PHOTOGRAPHER_MESSAGES.PROFILE_FETCHED);
  }

  async editProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const photographer = await this._photographerService.editProfile(
      userId,
      req.body
    );

    sendSuccess(res, { photographer }, PHOTOGRAPHER_MESSAGES.PROFILE_UPDATED);
  }

  async getPhotographers(req: Request, res: Response): Promise<void> {
    const { search, district, service, price, sortBy, page, limit } = req.query;

    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit ? parseInt(String(limit), 10) : 8;

    const result = await this._photographerService.getPhotographers(
      {
        search: search ? String(search) : undefined,
        district: district ? String(district) : undefined,
        service: service ? String(service) : undefined,
        price: price ? String(price) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
      },
      {
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 8 : limitNum,
      }
    );

    sendSuccess(
      res,
      {
        photographers: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      PHOTOGRAPHER_MESSAGES.PHOTOGRAPHERS_FETCHED
    );
  }

  async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const updatedProfile = await this._photographerService.editProfile(userId, {
      profilePhoto: req.body.profilePhoto,
    });

    sendSuccess(
      res,
      {
        photoUrl: updatedProfile.profilePhoto,
      },
      PHOTOGRAPHER_MESSAGES.PROFILE_UPDATED
    );
  }

  async uploadCoverPhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const updatedProfile = await this._photographerService.editProfile(userId, {
      coverPhoto: req.body.profilePhoto,
    });

    sendSuccess(
      res,
      {
        coverPhotoUrl: updatedProfile.coverPhoto,
      },
      PHOTOGRAPHER_MESSAGES.COVER_PHOTO_UPDATED
    );
  }

  async addPackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const {
      packageName,
      price,
      description,
      framesIncluded,
      droneIncluded,
      albumIncluded,
      videographersIncluded,
      status,
    } = req.body;

    if (!packageName || price === undefined || !description) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        PHOTOGRAPHER_MESSAGES.MISSING_PACKAGE_DETAILS
      );
    }

    const updatedProfile = await this._photographerService.addPackage(userId, {
      packageName,
      price: Number(price),
      description,
      framesIncluded: Boolean(framesIncluded),
      droneIncluded: Boolean(droneIncluded),
      albumIncluded: Boolean(albumIncluded),
      videographersIncluded: Boolean(videographersIncluded),
      status: status || "active",
    });

    sendSuccess(
      res,
      { photographer: updatedProfile },
      PHOTOGRAPHER_MESSAGES.PACKAGE_ADDED,
      HttpStatus.CREATED
    );
  }

  async editPackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const { packageId } = req.params;
    const {
      packageName,
      price,
      description,
      framesIncluded,
      droneIncluded,
      albumIncluded,
      videographersIncluded,
      status,
    } = req.body;

    if (!packageId || !packageName || price === undefined || !description) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        PHOTOGRAPHER_MESSAGES.MISSING_PACKAGE_DETAILS
      );
    }

    const updatedProfile = await this._photographerService.editPackage(
      userId,
      packageId as string,
      {
        packageName,
        price: Number(price),
        description,
        framesIncluded: Boolean(framesIncluded),
        droneIncluded: Boolean(droneIncluded),
        albumIncluded: Boolean(albumIncluded),
        videographersIncluded: Boolean(videographersIncluded),
        status: status || "active",
      }
    );

    sendSuccess(
      res,
      { photographer: updatedProfile },
      PHOTOGRAPHER_MESSAGES.PACKAGE_UPDATED
    );
  }

  async deletePackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const { packageId } = req.params;
    if (!packageId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        PHOTOGRAPHER_MESSAGES.MISSING_PACKAGE_ID
      );
    }

    const updatedProfile = await this._photographerService.deletePackage(
      userId,
      packageId as string
    );

    sendSuccess(
      res,
      { photographer: updatedProfile },
      PHOTOGRAPHER_MESSAGES.PACKAGE_DELETED
    );
  }
}
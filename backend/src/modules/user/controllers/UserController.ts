import type { Request, Response } from "express";
import type { IUserService } from "../interfaces/IUserService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import {
  COMMON_MESSAGES,
  USER_MESSAGES,
} from "../../../shared/constants/message.constant.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class UserController {
  constructor(private readonly _userService: IUserService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const user = await this._userService.getProfile(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: USER_MESSAGES.CURRENT_USER_FETCHED,
      data: {
        user,
      },
    });
  }

  async editProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const updatedUser = await this._userService.editProfile(userId, req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      message: USER_MESSAGES.PROFILE_UPDATED,
      data: {
        user: updatedUser,
      },
    });
  }

  async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const updatedUser = await this._userService.editProfile(userId, {
      profilePhoto: req.body.profilePhoto,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: USER_MESSAGES.PHOTO_UPLOADED,
      data: {
        photoUrl: updatedUser.profilePhoto,
      },
    });
  }

  async toggleSavePhotographer(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const rawPhotographerId = req.params.photographerId;
    const photographerId = Array.isArray(rawPhotographerId)
      ? rawPhotographerId[0]
      : rawPhotographerId;

    if (!photographerId) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Photographer ID is required");
    }

    const result = await this._userService.toggleSavePhotographer(
      userId,
      photographerId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.isSaved
        ? USER_MESSAGES.PHOTOGRAPHER_SAVED
        : USER_MESSAGES.PHOTOGRAPHER_UNSAVED,
      data: result,
    });
  }

  async checkIsPhotographerSaved(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const rawPhotographerId = req.params.photographerId;
    const photographerId = Array.isArray(rawPhotographerId)
      ? rawPhotographerId[0]
      : rawPhotographerId;

    if (!photographerId) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Photographer ID is required");
    }

    const isSaved = await this._userService.isPhotographerSaved(
      userId,
      photographerId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Status fetched successfully",
      data: { isSaved },
    });
  }

  async getSavedPhotographers(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const photographers = await this._userService.getSavedPhotographers(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: USER_MESSAGES.SAVED_PHOTOGRAPHERS_FETCHED,
      data: {
        photographers,
      },
    });
  }

  async getSavedPhotographerIds(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, COMMON_MESSAGES.UNAUTHORIZED);
    }

    const savedIds = await this._userService.getSavedPhotographerIds(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Saved photographer IDs fetched successfully",
      data: {
        savedIds,
      },
    });
  }
}

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
}

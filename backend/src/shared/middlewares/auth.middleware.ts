import type { Response, Request, NextFunction } from "express";
import { TokenService } from "../../modules/user/auth/services/TokenService.js";
import { AppError } from "../errors/AppError.js";
import { accountStatus } from "../enums/accountStatus.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../constants/message.constant.js";
import { Admin } from "../models/admin.model.js";
import { userRole } from "../enums/UserRole.js";
import User from "../models/user.model.js";
import Photographer from "../models/photographer.model.js";

const tokenService = new TokenService();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const decoded = tokenService.verifyAccessToken(token);
    let user;

    req.user = decoded;


    switch (req.user.role) {
      case userRole.USER:
        user = await User.findById(req.user.id);
        break;

      case userRole.ADMIN:
        user = await Admin.findById(req.user.id);
        break;

      case userRole.PHOTOGRAPHER:
        user = await Photographer.findById(req.user.id);
        break;

      default:
        throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }



    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.refreshToken) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== userRole.ADMIN) {
      const nonAdmin = user as { accountStatus: string };
      if (nonAdmin.accountStatus !== accountStatus.Active) {
        throw new AppError(HttpStatus.FORBIDDEN, AUTH_MESSAGES.SUSPENDED);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

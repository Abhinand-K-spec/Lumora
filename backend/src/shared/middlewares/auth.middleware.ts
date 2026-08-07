import type { Response, Request, NextFunction } from "express";
import { TokenService } from "../../modules/auth/services/TokenService.js";
import { AppError } from "../errors/AppError.js";
import { accountStatus } from "../enums/accountStatus.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../constants/message.constant.js";
import { Admin } from "../models/admin.model.js";
import { userRole } from "../enums/UserRole.js";
import Users from "../models/users.model.js";
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


    user = await Users.findById(req.user.id);



    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.refreshToken) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (user.accountStatus === accountStatus.Suspended) {
      throw new AppError(HttpStatus.FORBIDDEN, AUTH_MESSAGES.SUSPENDED);
    }

    next();
  } catch (error) {
    next(error);
  }
};

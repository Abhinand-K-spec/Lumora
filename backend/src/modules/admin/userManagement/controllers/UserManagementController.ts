import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import type { IUserManagementService } from "../interfaces/IUserManagementService.js";
import type { NextFunction, Request, Response } from "express";

export class UserManagementController {
  constructor(
    private readonly _userManagementService: IUserManagementService,
  ) {}

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const users = await this._userManagementService.getUsers();

      res.status(HttpStatus.OK).json({
        success: true,
        message: AUTH_MESSAGES.CURRENT_USER_FETCHED,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const user = await this._userManagementService.changeStatus(id, status);

      res.status(HttpStatus.OK).json({
        success: true,
        message: AUTH_MESSAGES.STATUS_UPDATED,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      await this._userManagementService.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

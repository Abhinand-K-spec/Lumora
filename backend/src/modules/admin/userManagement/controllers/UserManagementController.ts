import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import type { IUserManagementService } from "../interfaces/IUserManagementService.js";
import type { Request, Response } from "express";

export class UserManagementController {
  constructor(
    private readonly _userManagementService: IUserManagementService
  ) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    const { page, limit, search, status, sortField, sortOrder } = req.query;

    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit ? parseInt(String(limit), 10) : 5;

    const result = await this._userManagementService.getUsers(
      {
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        sortField: sortField ? String(sortField) : undefined,
        sortOrder:
          sortOrder === "desc" || sortOrder === "asc" ? sortOrder : undefined,
      },
      {
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 5 : limitNum,
      }
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: AUTH_MESSAGES.CURRENT_USER_FETCHED,
      data: result,
    });
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const { status } = req.body;

    const user = await this._userManagementService.changeStatus(id, status);

    res.status(HttpStatus.OK).json({
      success: true,
      message: AUTH_MESSAGES.STATUS_UPDATED,
      data: user,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    await this._userManagementService.delete(id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  }
}

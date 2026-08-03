import type { Request, Response, NextFunction } from "express";
import type { IUserService } from "../interfaces/IUserService.js";
import { HttpStatus } from "../../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../../shared/constants/message.constant.js";

export class UserController {
    constructor(
        private readonly userService: IUserService
    ) {}

    async getCurrentUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.id

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                });
                return;
            }

            const user = await this.userService.getCurrentUser(userId);

            res.status(HttpStatus.OK).json({
                success: true,
                message:AUTH_MESSAGES.CURRENT_USER_FETCHED,
                data: {
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

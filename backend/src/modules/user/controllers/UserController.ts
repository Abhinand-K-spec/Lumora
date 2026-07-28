import type { Request, Response, NextFunction } from "express";
import type { IUserService } from "../interfaces/IUserService.js";

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
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }

            const user = await this.userService.getCurrentUser(userId);

            res.status(200).json({
                success: true,
                message: "Current user fetched successfully",
                data: {
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

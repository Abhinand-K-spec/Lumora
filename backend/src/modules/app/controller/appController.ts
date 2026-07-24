import type { Request, Response, NextFunction } from "express";
import type { IAppService } from "../interfaces/IAppService.js";

export class AppController {
    constructor(
        private readonly appService: IAppService
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

            const user = await this.appService.getCurrentUser(userId);

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
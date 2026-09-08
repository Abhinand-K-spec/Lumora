import { userRole } from "../enums/UserRole.js";
import { COMMON_MESSAGES } from "../constants/message.constant.js";
import type { Request, Response, NextFunction } from "express";

export const authorize = (...roles: userRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: COMMON_MESSAGES.UNAUTHORIZED,
            });

            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: COMMON_MESSAGES.FORBIDDEN,
            });

            return;
        }

        next();
    };
};
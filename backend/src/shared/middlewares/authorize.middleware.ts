import { userRole } from "../enums/UserRole.js";
import type { Request, Response, NextFunction } from "express";


export const authorize = (...roles: userRole[]) => {
    return (req: Request,res: Response,next: NextFunction) => {

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });

            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Forbidden",
            });

            return;
        }

        next();
    };
};
import type { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";

export const uploadToCloudinaryMiddleware = (folder: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return next(new AppError(HttpStatus.BAD_REQUEST, "No file uploaded"));
            }
            const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, folder);
            
            req.body.profilePhoto = cloudinaryUrl;
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

import multer from "multer";
import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError(HttpStatus.BAD_REQUEST, "Only images are allowed"));
  }
};

export const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

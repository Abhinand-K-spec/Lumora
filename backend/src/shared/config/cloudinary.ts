import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../enums/HTTP.status.code";

const name = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

if (!name || !key || !secret) {
  throw new AppError(HttpStatus.BAD_REQUEST, "Cloudinary keys are missing");
}
cloudinary.config({
  cloud_name: name,
  api_key: key,
  api_secret: secret,
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

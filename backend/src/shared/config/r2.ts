import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";

dotenv.config();

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Missing required Cloudflare R2 environment variables");
}

export const R2_BUCKET = R2_BUCKET_NAME;

export const R2_PUBLIC_BASE_URL = R2_PUBLIC_URL?.replace(/\/+$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

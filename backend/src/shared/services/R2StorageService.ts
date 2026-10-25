import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AppError } from "../errors/AppError.js";
import { HttpStatus } from "../enums/HTTP.status.code.js";

import { r2Client, R2_BUCKET, R2_PUBLIC_BASE_URL } from "../config/r2.js";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ImageMimeType = keyof typeof ALLOWED_TYPES;

interface CreateUploadUrlInput {
  photographerId: string;
  contentType: string;
  size: number;
}

export interface IR2StorageService {
  createUploadUrl(
    input: CreateUploadUrlInput,
  ): Promise<{ key: string; uploadUrl: string; expiresIn: number }>;
  verifyObject(
    key: string,
  ): Promise<{ key: string; size: number; contentType: string | undefined }>;
  getPublicUrl(key: string): Promise<string>;
  getModerationUrl(key:string):Promise<string>;
}

export class R2StorageService implements IR2StorageService {
  async createUploadUrl(input: CreateUploadUrlInput) {
    const { photographerId, contentType, size } = input;

    if (!Object.hasOwn(ALLOWED_TYPES, contentType)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Unsupported image type");
    }

    if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_FILE_SIZE) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Image must not exceed 15 MB");
    }

    const extension = ALLOWED_TYPES[contentType as ImageMimeType];
    const key = `photographers/${photographerId}/feed/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 300,
    });

    return {
      key,
      uploadUrl,
      expiresIn: 300,
    };
  }

  async verifyObject(key: string) {
    const result = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );

    if (
      result.ContentLength == null ||
      result.ContentLength <= 0 ||
      result.ContentLength > MAX_FILE_SIZE
    ) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "Uploaded image is empty or exceeds the size limit",
      );
    }

    return {
      key,
      size: result.ContentLength,
      contentType: result.ContentType,
    };
  }

  async getPublicUrl(key: string): Promise<string> {
    if (
      R2_PUBLIC_BASE_URL &&
      !R2_PUBLIC_BASE_URL.includes("r2.cloudflarestorage.com")
    ) {
      const encodedKey = key
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

      return `${R2_PUBLIC_BASE_URL}/${encodedKey}`;
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, {
      expiresIn: 86400, 
    });
  }

  async getModerationUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
  
    return getSignedUrl(r2Client, command, {
      expiresIn: 300,
    });
  }
}

export const r2StorageService = new R2StorageService();

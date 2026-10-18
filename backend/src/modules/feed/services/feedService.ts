import type {
  IFeedService,
  CreateFeedPostInput,
} from "../interfaces/IFeedService.js";
import { Types } from "mongoose";
import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";
import type { IFeedRepository } from "../interfaces/IFeedPostRepository.js";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { FEED_MESSAGES } from "../../../shared/constants/message.constant.js";

const MAX_IMAGES_PER_POST = 10;
const MAX_CAPTION_LENGTH = 1000;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class FeedService implements IFeedService {
  constructor(
    private readonly _feedRepository: IFeedRepository,
    private readonly _r2StorageService: IR2StorageService,
  ) {}

  async createPost(input: CreateFeedPostInput): Promise<IFeedPost> {
    const { photographerId, mediaKeys } = input;
    const caption = input.caption?.trim() ?? "";


    if (caption.length > MAX_CAPTION_LENGTH) {
      throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.MAX_CAPTION);
    }

    if (
      !Array.isArray(mediaKeys) ||
      mediaKeys.length < 1 ||
      mediaKeys.length > MAX_IMAGES_PER_POST
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.MIN_IMAGES);
    }

    if (new Set(mediaKeys).size !== mediaKeys.length) {
      throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.DUPLICATE_IMAGES);
    }


    const expectedPrefix = `photographers/${photographerId}/feed/`;

    for (const key of mediaKeys) {
      if (
        typeof key !== "string" ||
        !key.startsWith(expectedPrefix) ||
        key.length <= expectedPrefix.length
      ) {
        throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_IMAGE_KEY);
      }
    }


    const media = await Promise.all(
      mediaKeys.map(async (key, order) => {
        const object = await this._r2StorageService.verifyObject(key);

        if (!object.contentType || !ALLOWED_IMAGE_TYPES.has(object.contentType)) {
          throw new AppError(HttpStatus.BAD_REQUEST, FEED_MESSAGES.INVALID_TYPE);
        }

        return {
          key: object.key,
          contentType: object.contentType,
          size: object.size,
          order,
        };
      })
    );


    const post = await this._feedRepository.create({
      photographerId: new Types.ObjectId(photographerId),
      caption,
      media,
      status: "published",
    } as Partial<IFeedPost>);

    return post;
  }
}
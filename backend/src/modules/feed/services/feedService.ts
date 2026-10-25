import type {
  IFeedService,
  CreateFeedPostInput,
  GetFeedInputDto,
  GetFeedResponseDto,
} from "../interfaces/IFeedService.js";
import { Types } from "mongoose";
import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";
import type { IFeedRepository } from "../interfaces/IFeedPostRepository.js";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { FEED_MESSAGES } from "../../../shared/constants/message.constant.js";
import type { IUserRepository } from "../../auth/interfaces/IUserRepository.js";
import { FeedPostMapper } from "../dto/FeedPostMapper.js";
import type { IContentModerationService } from "../../../shared/services/ContentModerationService.js";

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
    private readonly _userRepository: IUserRepository,
    private readonly _contentModerationService: IContentModerationService
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
      }),
    );


    const imageUrls = await Promise.all(
      mediaKeys.map((key) =>
        this._r2StorageService.getModerationUrl(key),
      ),
    );

    const moderationResult =
      await this._contentModerationService.moderatePost(
        caption,
        imageUrls,
      );


    if (moderationResult.flagged) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "This post cannot be published because it violates content guidelines.",
      );
    }

    const post = await this._feedRepository.create({
      photographerId: new Types.ObjectId(photographerId),
      caption,
      media,
      status: "published",
    } as Partial<IFeedPost>);

    return post;
  }

  async getFeed(input: GetFeedInputDto): Promise<GetFeedResponseDto> {
    const limit = Math.max(1, Math.min(input.limit || 10, 50));

    const result = await this._feedRepository.getFeed({
      limit,
      cursor: input.cursor,
      photographerId: input.photographerId,
    });


    const userIds = [
      ...new Set(
        result.posts
          .map((doc: any) => doc.photographerId?.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    let userMap = new Map<string, string>();
    if (userIds.length > 0 && this._userRepository) {
      const users = await this._userRepository.findWithFilter({
        _id: { $in: userIds },
      });
      userMap = new Map(users.map((u) => [u._id.toString(), u.name]));
    }

    const posts = await Promise.all(
      result.posts.map(async (doc: any) => {
        const userId = doc.photographerId?.userId;
        const authorName =
          (userId && userMap.get(userId.toString())) || "Photographer";
        return await FeedPostMapper.toPostResponseDto(
          doc,
          authorName,
          this._r2StorageService,
        );
      }),
    );

    return FeedPostMapper.toFeedResponseDto(posts, result.hasMore);
  }

  async deletePost(postId: string, photographerId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid post ID");
    }
    const success = await this._feedRepository.deletePost(postId, photographerId);
    if (!success) {
      throw new AppError(HttpStatus.NOT_FOUND, "Post not found or unauthorized");
    }
  }
}

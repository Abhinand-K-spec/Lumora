import type {
  FeedPostResponseDto,
  GetFeedResponseDto,
} from "./FeedPostResponseDto.js";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";
import type {
  IPopulatedFeedPostDoc,
  IPopulatedPhotographer,
  IFeedMedia,
} from "../../../shared/interfaces/IFeedPost.js";

export class FeedPostMapper {
  static async toPostResponseDto(
    doc: IPopulatedFeedPostDoc,
    authorName: string,
    r2StorageService: IR2StorageService,
  ): Promise<FeedPostResponseDto> {
    const photographer =
      typeof doc.photographerId === "object" &&
      doc.photographerId !== null &&
      "_id" in doc.photographerId
        ? (doc.photographerId as IPopulatedPhotographer)
        : null;

    const photographerId = photographer?._id
      ? photographer._id.toString()
      : typeof doc.photographerId === "string" ||
          (doc.photographerId && "toString" in doc.photographerId)
        ? doc.photographerId.toString()
        : "";

    const authorId = photographer?.userId
      ? photographer.userId.toString()
      : photographerId;

    const media = Array.isArray(doc.media)
      ? await Promise.all(
          doc.media.map(async (m: IFeedMedia) => ({
            url: await r2StorageService.getPublicUrl(m.key),
            contentType: m.contentType ?? "",
            order: typeof m.order === "number" ? m.order : 0,
          })),
        )
      : [];

    return {
      id: doc._id?.toString() ?? "",
      caption: doc.caption ?? "",
      createdAt:
        doc.createdAt instanceof Date
          ? doc.createdAt
          : doc.createdAt
            ? new Date(doc.createdAt)
            : new Date(),
      media,
      author: {
        id: photographer?.userId ? photographer.userId.toString() : photographerId,
        name: authorName || "Photographer",
        profilePhoto: photographer?.profilePhoto || undefined,
        location: photographer?.location || undefined,
      },
    };
  }

  static toFeedResponseDto(
    posts: FeedPostResponseDto[],
    hasMore: boolean,
  ): GetFeedResponseDto {
    let nextCursor: string | undefined = undefined;

    if (hasMore && posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      if (lastPost) {
        nextCursor = Buffer.from(
          JSON.stringify({
            createdAt: lastPost.createdAt,
            id: lastPost.id,
          }),
        ).toString("base64");
      }
    }

    return {
      posts,
      hasMore,
      ...(nextCursor ? { nextCursor } : {}),
    };
  }
}

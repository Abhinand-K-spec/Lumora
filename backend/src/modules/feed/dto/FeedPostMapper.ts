import type {
  FeedPostResponseDto,
  GetFeedResponseDto,
} from "./FeedPostResponseDto.js";
import type { IR2StorageService } from "../../../shared/services/R2StorageService.js";

export class FeedPostMapper {
  static async toPostResponseDto(
    doc: any,
    authorName: string,
    r2StorageService: IR2StorageService,
  ): Promise<FeedPostResponseDto> {
    const photographer = doc.photographerId;
    const photographerId = photographer?._id
      ? photographer._id.toString()
      : typeof doc.photographerId === "string" || doc.photographerId?.toString
        ? doc.photographerId.toString()
        : "";

    const media = Array.isArray(doc.media)
      ? await Promise.all(
          doc.media.map(async (m: any) => ({
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
        doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
      media,
      author: {
        id: photographerId,
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

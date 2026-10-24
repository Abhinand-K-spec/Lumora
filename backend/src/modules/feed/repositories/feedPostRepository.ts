import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";
import type {
  GetFeedInput,
  GetFeedResult,
  IFeedRepository,
} from "../interfaces/IFeedPostRepository.js";
import { FeedPostModel } from "../../../shared/models/feed.post.models.js";
import { Types } from "mongoose";

export class FeedPostRepository
  extends BaseRepository<IFeedPost>
  implements IFeedRepository
{
  constructor() {
    super(FeedPostModel);
  }
  async getFeed(input: GetFeedInput): Promise<GetFeedResult> {
    const { limit, cursor, photographerId } = input;
    const filter: Record<string, unknown> = {
      status: "published",
    };
    if (photographerId && Types.ObjectId.isValid(photographerId)) {
      filter.photographerId = new Types.ObjectId(photographerId);
    }
    if (cursor && Types.ObjectId.isValid(cursor.id)) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        {
          createdAt: cursor.createdAt,
          _id: { $lt: new Types.ObjectId(cursor.id) },
        },
      ];
    }
    const documents = await FeedPostModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate({
        path: "photographerId",
        select: "userId profilePhoto location",
      })
      .lean()
      .exec();
    const hasMore = documents.length > limit;
    const posts = documents.slice(0, limit);
    return {
      posts: posts as unknown as IFeedPost[],
      hasMore,
    };
  }

  async deletePost(postId: string, photographerId: string): Promise<boolean> {
    const result = await FeedPostModel.findOneAndDelete({
      _id: new Types.ObjectId(postId),
      photographerId: new Types.ObjectId(photographerId),
    });
    return !!result;
  }
}

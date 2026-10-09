import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";
import type { IFeedRepository } from "../interfaces/IFeedPostRepository.js";
import { FeedPostModel } from "../../../shared/models/feed.post.models.js";

export class FeedPostRepository
  extends BaseRepository<IFeedPost>
  implements IFeedRepository
{
  constructor() {
    super(FeedPostModel);
  }
}
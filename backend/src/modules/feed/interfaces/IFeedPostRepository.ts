import type {
  IFeedPost,
  IPopulatedFeedPostDoc,
} from "../../../shared/interfaces/IFeedPost.js";

export interface FeedCursor {
  createdAt: Date;
  id: string;
}

export interface GetFeedInput {
  limit: number;
  cursor?: FeedCursor | undefined;
  photographerId?: string | undefined;
}

export interface GetFeedResult {
  posts: IPopulatedFeedPostDoc[];
  hasMore: boolean;
}

export interface IFeedRepository {
  create(data: Partial<IFeedPost>): Promise<IFeedPost>;
  getFeed(input: GetFeedInput): Promise<GetFeedResult>;
  deletePost(postId: string, photographerId: string): Promise<boolean>;
}

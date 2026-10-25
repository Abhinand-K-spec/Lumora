import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";
import type {
  FeedAuthorDto,
  FeedMediaDto,
  FeedPostResponseDto,
  GetFeedResponseDto,
} from "../dto/FeedPostResponseDto.js";

export type {
  FeedAuthorDto,
  FeedMediaDto,
  FeedPostResponseDto,
  GetFeedResponseDto,
};

export interface CreateFeedPostInput {
  photographerId: string;
  caption?: string | undefined;
  mediaKeys: string[];
}

export interface GetFeedInputDto {
  limit: number;
  cursor?: { createdAt: Date; id: string } | undefined;
}

export interface IFeedService {
  createPost(input: CreateFeedPostInput): Promise<IFeedPost>;
  getFeed(input: GetFeedInputDto): Promise<GetFeedResponseDto>;
}

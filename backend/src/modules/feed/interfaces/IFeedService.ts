import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";

export interface CreateFeedPostInput {
  photographerId: string;
  caption?: string;
  mediaKeys: string[];
}

export interface IFeedService {
  createPost(input: CreateFeedPostInput): Promise<IFeedPost>;
}
import type { IFeedPost } from "../../../shared/interfaces/IFeedPost.js";

export interface IFeedRepository {
  create(data: Partial<IFeedPost>): Promise<IFeedPost>;
}
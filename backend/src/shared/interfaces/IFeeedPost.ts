import { Types } from "mongoose";

export interface IFeedMedia {
  key: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  order: number;
}

export interface IFeedPost {
  photographerId: Types.ObjectId;
  caption: string;
  media: IFeedMedia[];
  status: "published" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}
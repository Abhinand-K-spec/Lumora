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
  _id?: Types.ObjectId | string;
  photographerId: Types.ObjectId;
  caption: string;
  media: IFeedMedia[];
  status: "published" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPopulatedPhotographer {
  _id: Types.ObjectId | string;
  userId?: Types.ObjectId | string;
  profilePhoto?: string;
  location?: string;
}

export interface IPopulatedFeedPostDoc {
  _id?: Types.ObjectId | string;
  photographerId: IPopulatedPhotographer | Types.ObjectId | string;
  caption?: string;
  media?: IFeedMedia[];
  status?: "published" | "draft";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}


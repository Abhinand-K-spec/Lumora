import { Schema, model } from "mongoose";
import type { IFeedPost } from "../interfaces/IFeedPost";

const feedMediaSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
      max: 15 * 1024 * 1024,
    },
    width: {
      type: Number,
      min: 1,
    },
    height: {
      type: Number,
      min: 1,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const feedPostSchema = new Schema<IFeedPost>(
  {
    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Photographer",
      required: true,
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    media: {
      type: [feedMediaSchema],
      required: true,
      validate: {
        validator: (media: unknown[]) =>
          media.length >= 1 && media.length <= 10,
        message: "A post must contain between 1 and 10 images",
      },
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

feedPostSchema.index({
  photographerId: 1,
  createdAt: -1,
});

export const FeedPostModel = model<IFeedPost>(
  "FeedPost",
  feedPostSchema
);
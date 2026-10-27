import { Schema, model } from "mongoose";
import type { ISavedPhotographer } from "../interfaces/ISavedPhotographer.js";

const savedPhotographerSchema = new Schema<ISavedPhotographer>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    photographerId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

savedPhotographerSchema.index(
  { userId: 1, photographerId: 1 },
  { unique: true },
);

const SavedPhotographer = model<ISavedPhotographer>(
  "SavedPhotographer",
  savedPhotographerSchema,
);

export default SavedPhotographer;

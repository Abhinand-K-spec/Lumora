import { Schema, model } from "mongoose";
import type { IAvailability } from "../interfaces/IAvailability.js";

const availabilitySchema = new Schema<IAvailability>(
  {
    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["BLOCKED"],
      default: "BLOCKED",
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({
  photographerId: 1,
  startDate: 1,
  endDate: 1,
});

export const AvailabilityModel = model<IAvailability>(
  "Availability",
  availabilitySchema
);
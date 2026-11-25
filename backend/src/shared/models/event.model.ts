import { Schema, model } from "mongoose";
import type { IEvent } from "../interfaces/iEvent";

const eventProgramSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    coordinates: {
      type: [Number],
      default: undefined,
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    coverImage: {
      type: String,
    },

    programs: {
      type: [eventProgramSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one event program is required.",
      },
    },

    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index(
  { bookingId: 1 },
  { unique: true }
);

eventSchema.index({ photographerId: 1, createdAt: -1 });

const Event = model<IEvent>("Event", eventSchema);

export default Event;
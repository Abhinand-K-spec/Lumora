import { Schema, model } from "mongoose";
import type { IPhotographer } from "../interfaces/IPhotographer.js";


const serviceAreaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    center: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    radiusKm: {
      type: Number,
      required: true,
      min: 1,
      max: 200,
    },
  },
  {
    _id: true,
  }
);

const photographerSchema = new Schema<IPhotographer>(
  {
    phone: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
    },

    bio: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    coverPhoto: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    specialities: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    serviceRegions: {
      type: [String],
      default: [],
    },
    serviceAreas:{
      type:[serviceAreaSchema],
      default:[]
    },
    startingPrice: {
      type: Number,
      default: 0,
      index: true,
    },
    instagramUrl: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
      default: "DRAFT",
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  },
);

photographerSchema.index({
  "serviceAreas.center": "2dsphere",
});

const Photographer = model<IPhotographer>("Photographer", photographerSchema);
export default Photographer;

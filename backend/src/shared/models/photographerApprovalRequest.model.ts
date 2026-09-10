import { Schema, model } from "mongoose";
import type { IPhotographerApprovalRequest } from "../interfaces/IPhotographerApprovalRequest.js";

const photographerApprovalRequestSchema =
  new Schema<IPhotographerApprovalRequest>(
    {
      photographerId: {
        type: Schema.Types.ObjectId,
        ref: "Photographer",
        required: true,
        index: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
        index: true,
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      reviewedAt: {
        type: Date,
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
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

// Enforce only one PENDING request per photographer at database level
photographerApprovalRequestSchema.index(
  { photographerId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } },
);

const PhotographerApprovalRequest = model<IPhotographerApprovalRequest>(
  "PhotographerApprovalRequest",
  photographerApprovalRequestSchema,
);

export default PhotographerApprovalRequest;

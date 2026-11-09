import { Schema, model } from "mongoose";
import type { IQuotation } from "../interfaces/IQuotation";

const quotationItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const quotationSchema = new Schema<IQuotation>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [quotationItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "A quotation must contain at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    validUntil: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SENT",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "SUPERSEDED",
      ],
      default: "DRAFT",
    },
    submittedAt: Date,
    respondedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true },
);

export const Quotation = model<IQuotation>(
  "Quotation",
  quotationSchema,
);
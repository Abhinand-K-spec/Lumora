import { Schema, model } from "mongoose";
import type { IPayment } from "../interfaces/IPayment";

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    quotationId: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
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

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    paymentType: {
      type: String,
      enum: ["ADVANCE", "FINAL"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    gateway: {
      type: String,
      enum: ["RAZORPAY"],
      required: true,
    },

    gatewayOrderId: {
      type: String,
      sparse: true,
    },

    gatewayPaymentId: {
      type: String,
      sparse: true,
    },

    paidAt: Date,

    failureReason: String,
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ gatewayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ gatewayPaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ bookingId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ photographerId: 1, createdAt: -1 });
export const PaymentModel = model<IPayment>("Payment", paymentSchema);
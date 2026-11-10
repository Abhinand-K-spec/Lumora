import { Types } from "mongoose";

export type PaymentType = "ADVANCE" | "FINAL";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export type PaymentGateway = "RAZORPAY";

export interface IPayment {
  bookingId: Types.ObjectId;
  quotationId: Types.ObjectId;
  userId: Types.ObjectId;
  photographerId: Types.ObjectId;

  amount: number;
  currency: "INR";

  paymentType: PaymentType;
  status: PaymentStatus;

  gateway: PaymentGateway;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;

  paidAt?: Date;
  failureReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
import { Types } from "mongoose";

export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "SUPERSEDED";

export interface IQuotationItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IQuotation {
  _id?: Types.ObjectId;

  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  photographerId: Types.ObjectId;

  quotationNumber: string;

  items: IQuotationItem[];

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  advanceAmount: number;
  remainingAmount: number;

  notes?: string;
  validUntil: Date;

  status: QuotationStatus;

  submittedAt?: Date;
  respondedAt?: Date;
  rejectionReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
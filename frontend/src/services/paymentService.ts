
import api from "../api/axios";

export interface CreateAdvanceOrderResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
}

export interface VerifyAdvancePaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentCounterpartInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface PaymentBookingEventInfo {
  eventType: string;
  eventDate: string;
  location?: string;
}

export interface PaymentBookingInfo {
  _id: string;
  events?: PaymentBookingEventInfo[];
  status?: string;
  paymentStatus?: string;
}

export interface PaymentQuotationInfo {
  _id: string;
  quotationNumber?: string;
  total?: number;
  advanceAmount?: number;
}

export interface PaymentItem {
  _id: string;
  bookingId: string | PaymentBookingInfo;
  quotationId: string | PaymentQuotationInfo;
  userId: string | PaymentCounterpartInfo;
  photographerId: string | PaymentCounterpartInfo;
  amount: number;
  currency: "INR";
  paymentType: "ADVANCE" | "FINAL";
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  gateway: "RAZORPAY";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

const createAdvanceOrder = async (
  quotationId: string
): Promise<CreateAdvanceOrderResponse> => {
  const response = await api.post(
    "/payments/advance/order",
    { quotationId }
  );

  return response.data.data;
};

const verifyAdvancePayment = async (
  payload: VerifyAdvancePaymentPayload
) => {
  const response = await api.post(
    "/payments/advance/verify",
    payload
  );

  return response.data.data;
};

const getUserPayments = async (): Promise<PaymentItem[]> => {
  const response = await api.get("/payments/user");
  return response.data.data;
};

const getPhotographerPayments = async (): Promise<PaymentItem[]> => {
  const response = await api.get("/payments/photographer");
  return response.data.data;
};

export const paymentService = {
  createAdvanceOrder,
  verifyAdvancePayment,
  getUserPayments,
  getPhotographerPayments,
};


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

export const paymentService = {
  createAdvanceOrder,
  verifyAdvancePayment,
};

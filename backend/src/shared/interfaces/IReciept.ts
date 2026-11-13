import type { PaymentType } from "./IPayment";

export interface IReceiptData {
  receiptNumber: string;
  issuedAt: Date;

  customer: {
    name: string;
    email: string;
  };

  photographer: {
    name: string;
  };

  booking: {
    bookingId: string;
    events: {
      eventType: string;
      eventDate: Date;
      location?: string;
    }[];
  };

  quotation: {
    quotationNumber: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    totalAmount: number;
  };

  payment: {
    paymentId: string;
    paymentType: PaymentType;
    amount: number;
    currency: string;
    gateway: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    paidAt: Date;
    status: "SUCCESS";
  };
}
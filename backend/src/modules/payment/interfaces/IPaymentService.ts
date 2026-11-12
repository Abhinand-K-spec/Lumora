import type { IPayment } from "../../../shared/interfaces/IPayment";
import type { VerifyAdvancePaymentDTO } from "../dtos/verifyAdvancePaymentDto";

export interface CreateAdvanceOrderResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
}

export interface IPaymentService {
  createAdvanceOrder(
    userId: string,
    quotationId: string
  ): Promise<CreateAdvanceOrderResponse>;

  verifyAdvancePayment(
    userId: string,
    data: VerifyAdvancePaymentDTO
  ): Promise<IPayment>;

  getUserPayments(
    userId:string
  ):Promise<IPayment[]>;

  getPhotographerPayments(
    photographerId:string
  ):Promise<IPayment[]>;
}
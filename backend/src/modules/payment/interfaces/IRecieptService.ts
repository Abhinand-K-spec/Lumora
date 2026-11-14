import type { IPayment } from "../../../shared/interfaces/IPayment";

export interface IReceiptService {
  sendPaymentReceipt(payment: IPayment): Promise<void>;
}
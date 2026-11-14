import type { IReceiptService } from "../interfaces/IRecieptService.js";
import type { IPayment } from "../../../shared/interfaces/IPayment.js";

import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository.js";
import type { IQuotationRepository } from "../../quotation/interfaces/IQuotationRepository.js";
import type { IUserRepository } from "../../auth/interfaces/IUserRepository.js";
import type { IEmailService } from "../../../shared/interfaces/IEmailService.js";

import { ReceiptMapper } from "../dtos/recieptMapper.js";
import { ReceiptPdfGenerator } from "../utils/recieptPdfGenerator.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { RECIEPT_MESSAGES } from "../../../shared/constants/message.constant.js";

export class ReceiptService implements IReceiptService {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _quotationRepository: IQuotationRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _emailService: IEmailService
  ) {}

  async sendPaymentReceipt(payment: IPayment): Promise<void> {
    if (payment.status !== "SUCCESS" || !payment.paidAt) {
      throw new AppError(HttpStatus.BAD_REQUEST,RECIEPT_MESSAGES.ONLY_IF_SENT);
    }

    const [booking, quotation, customer, photographer] = await Promise.all([
      this._bookingRepository.findById(payment.bookingId.toString()),
      this._quotationRepository.findById(payment.quotationId.toString()),
      this._userRepository.findById(payment.userId.toString()),
      this._userRepository.findById(payment.photographerId.toString()),
    ]);

    if (!booking || !quotation || !customer || !photographer) {
      throw new AppError(HttpStatus.BAD_REQUEST,RECIEPT_MESSAGES.RECORDS_NOT_FOUND);
    }

    const receiptDTO = ReceiptMapper.toDTO(
      payment,
      booking,
      quotation,
      customer,
      photographer
    );

    const pdfBuffer = await ReceiptPdfGenerator.generate(receiptDTO);

    await this._emailService.sendEmailWithAttachment(
      customer.email,
      `Payment Receipt - ${receiptDTO.receiptNumber}`,
      `<p>Hello ${customer.name},</p>
       <p>Your payment was successfully received. Please find your receipt attached.</p>
       <p>Thank you for choosing Lumora!</p>`,
      [
        {
          filename: `${receiptDTO.receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ]
    );
  }
}
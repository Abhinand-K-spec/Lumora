import crypto from 'crypto';
import { razorpay } from "../../../shared/config/razorpay";
import { AUTH_MESSAGES, BOOKING_MESSAGES, PAYMENT_MESSAGES, QUOTATION_MESSAGES } from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { IPayment } from "../../../shared/interfaces/IPayment";
import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository";
import type { IQuotationRepository } from "../../quotation/interfaces/IQuotationRepository";
import type { VerifyAdvancePaymentDTO } from "../dtos/verifyAdvancePaymentDto";
import type { IPaymentRepository } from "../interfaces/IPaymentRepository";
import type { CreateAdvanceOrderResponse } from "../interfaces/IPaymentService";
import type { IPaymentService } from "../interfaces/IPaymentService";

export class PaymentService implements IPaymentService{
    constructor(
        private readonly _paymentRepository : IPaymentRepository,
        private readonly _bookingRepository : IBookingRepository,
        private readonly _quotationRepository : IQuotationRepository
    ){}

    async createAdvanceOrder(userId:string,quotationId:string):Promise<CreateAdvanceOrderResponse>{

        const quotation = await this._quotationRepository.findByIdAndUser(quotationId,userId);

        if(!quotation){
            throw new AppError(HttpStatus.NOT_FOUND,QUOTATION_MESSAGES.NOT_FOUND);
        };

        if(quotation.status !== 'ACCEPTED'){
            throw new AppError(HttpStatus.BAD_REQUEST,PAYMENT_MESSAGES.NOT_ACCEPTED_QUOTATION);
        };

        if(new Date(quotation.validUntil).getTime()<Date.now()){
            throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.DATE_EXPIRED);
        };

        const booking = await this._bookingRepository.findById(quotation.bookingId.toString());

        if(!booking || booking.userId.toString() !== userId){
            throw new AppError(HttpStatus.BAD_REQUEST,BOOKING_MESSAGES.BOOKING_NOT_FOUND);
        };

        const advanceAmount = quotation.advanceAmount;

        if (!Number.isFinite(advanceAmount) || advanceAmount <= 0) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.INVALID_ADVANCE_AMNT
          );
        };

        const existingPayments =
        await this._paymentRepository.findByBookingId(
          quotation.bookingId.toString()
        );
  
      const successfulAdvancePayment = existingPayments.find(
        (payment) =>
          payment.paymentType === "ADVANCE" &&
          payment.status === "SUCCESS"
      );
  
      if (successfulAdvancePayment) {
        throw new AppError(
          HttpStatus.CONFLICT,
          "Advance payment has already been completed."
        );
      }

      const amountInPaise = Math.round(advanceAmount*100);

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `adv_${quotationId}_${Date.now()}`,
        notes: {
          quotationId,
          bookingId: quotation.bookingId.toString(),
          userId,
          paymentType: "ADVANCE",
        },
      });

      const paymentPayload: Partial<IPayment> = {
        bookingId: quotation.bookingId,
        quotationId: quotation._id!,
        userId: quotation.userId,
        photographerId: quotation.photographerId,
        amount: advanceAmount,
        currency: "INR",
        paymentType: "ADVANCE",
        status: "PENDING",
        gateway: "RAZORPAY",
        gatewayOrderId: razorpayOrder.id,
      };

      const payment = await this._paymentRepository.create(
        paymentPayload
      );

      return {
        paymentId: payment._id!.toString(),
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID!,
      };

    }

    async verifyAdvancePayment(
        userId: string,
        data: VerifyAdvancePaymentDTO
      ): Promise<IPayment> {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        } = data;
      
        const payment =
          await this._paymentRepository.findByGatewayOrderId(
            razorpay_order_id
          );
      
        if (!payment) {
          throw new AppError(
            HttpStatus.NOT_FOUND,
            PAYMENT_MESSAGES.NOT_FOUND
          );
        }
      

        if (payment.userId.toString() !== userId) {
          throw new AppError(
            HttpStatus.FORBIDDEN,
            AUTH_MESSAGES.UNAUTHORIZED
          );
        }
      
        if (payment.status === "SUCCESS") {
          if (payment.gatewayPaymentId !== razorpay_payment_id) {
            throw new AppError(
              HttpStatus.CONFLICT,
              PAYMENT_MESSAGES.PAYMENT_ALREADY_COMPLETED
            );
          }
      
          return payment;
        }
      
        if (payment.status !== "PENDING") {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.CANNOT_VERIFY
          );
        }
      
        const secret = process.env.RAZORPAY_SECRET;
      
        if (!secret) {
          throw new AppError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Payment gateway configuration is missing."
          );
        }
      
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");
      
        const receivedBuffer = Buffer.from(
          razorpay_signature,
          "hex"
        );
      
        const expectedBuffer = Buffer.from(
          expectedSignature,
          "hex"
        );
      
        if (
          !/^[a-fA-F0-9]{128}$/.test(razorpay_signature) ||
          receivedBuffer.length !== expectedBuffer.length ||
          !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
        ) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.INVALID_SIGNATURE
          );
        }
      
        const gatewayPayment = await razorpay.payments.fetch(
          razorpay_payment_id
        );
      
        if (gatewayPayment.order_id !== razorpay_order_id) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.INVALID_SIGNATURE
          );
        }
      
        if (gatewayPayment.status !== "captured") {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.NOT_CAPTURED
          );
        }
      
        const expectedAmount = Math.round(payment.amount * 100);
      
        if (gatewayPayment.amount !== expectedAmount) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            PAYMENT_MESSAGES.AMOUNT_MISMATCH
          );
        }
      
        const updatedPayment = await this._paymentRepository.update(
            payment._id!.toString(),
            {
              status: "SUCCESS",
              gatewayPaymentId: razorpay_payment_id,
              paidAt: new Date(),
            }
          );
          
          if (!updatedPayment) {
            throw new AppError(
              HttpStatus.INTERNAL_SERVER_ERROR,
              PAYMENT_MESSAGES.UNABLE_TO_UPDATE
            );
          }
          
          const updatedBooking = await this._bookingRepository.update(
            payment.bookingId.toString(),
            {
              paymentStatus: "PARTIALLY_PAID",
              advancePaid: payment.amount,
            }
          );
          
          if (!updatedBooking) {
            throw new AppError(
              HttpStatus.INTERNAL_SERVER_ERROR,
              "Payment verified, but booking update failed."
            );
          }
          
          return updatedPayment;
      }
}
import type { IPayment } from "../../../shared/interfaces/IPayment";
import type { IBooking } from "../../../shared/interfaces/IBooking";
import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import type { IUsers } from "../../../shared/interfaces/IUsers";
import type { ReceiptDTO } from "./recieptDto";

export class ReceiptMapper {
  static toDTO(
    payment: IPayment,
    booking: IBooking,
    quotation: IQuotation,
    customer: IUsers,
    photographer: IUsers
  ): ReceiptDTO {

    if (payment.status !== "SUCCESS" || !payment.paidAt) {
      throw new Error("Cannot generate receipt for unsuccessful payment.");
    }

    return {
      receiptNumber: `LUM-RCP-${payment._id.toString()}`,
      issuedAt: payment.paidAt,

      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },

      photographer: {
        name: photographer.name,
        email: photographer.email,
        phone: photographer.phone,
      },

      booking: {
        bookingId: payment.bookingId.toString(),
        events: booking.events.map((event) => ({
            eventType: event.eventType,
            eventDate: event.eventDate,
            ...(event.location !== undefined && {
              location: event.location,
            }),
          })),
      },

      quotation: {
        quotationNumber: quotation.quotationNumber,
        items: quotation.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        totalAmount: quotation.total,
      },

      payment: {
        paymentId: payment._id.toString(),
        paymentType: payment.paymentType,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        ...(payment.gatewayOrderId !== undefined && {
            gatewayOrderId: payment.gatewayOrderId,
          }),
        
          ...(payment.gatewayPaymentId !== undefined && {
            gatewayPaymentId: payment.gatewayPaymentId,
          }),
        paidAt: payment.paidAt,
      },
    };
  }
}
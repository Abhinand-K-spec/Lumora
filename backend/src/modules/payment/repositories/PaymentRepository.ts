import type { IPayment } from "../../../shared/interfaces/IPayment";
import { PaymentModel } from "../../../shared/models/payment.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IPaymentRepository } from "../interfaces/IPaymentRepository";


export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository{
    constructor(){super(PaymentModel)}
    async findByGatewayOrderId(orderId: string): Promise<IPayment | null> {
        return await this._model.findOne({gatewayOrderId:orderId});
    }

    async findByBookingId(bookingId: string): Promise<IPayment[]> {
        return await this._model.find({bookingId}).sort({createdAt:-1});
    }

    async findByGatewayPaymentId(paymentId: string): Promise<IPayment | null> {
        return await this._model.findOne({gatewayPaymentId:paymentId});
    }
}
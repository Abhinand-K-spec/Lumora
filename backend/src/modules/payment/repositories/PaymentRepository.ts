import type { IPayment } from "../../../shared/interfaces/IPayment";
import { PaymentModel } from "../../../shared/models/payment.model";
import Booking from "../../../shared/models/booking.model";
import { Quotation } from "../../../shared/models/quotation.model";
import Users from "../../../shared/models/users.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IPaymentRepository } from "../interfaces/IPaymentRepository";


export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository {
    constructor(){
        super(PaymentModel);
        void Booking;
        void Quotation;
        void Users;
    }
    async findByGatewayOrderId(orderId: string): Promise<IPayment | null> {
        return await this._model.findOne({gatewayOrderId:orderId});
    }

    async findByBookingId(bookingId: string): Promise<IPayment[]> {
        return await this._model.find({bookingId}).sort({createdAt:-1});
    }

    async findByGatewayPaymentId(paymentId: string): Promise<IPayment | null> {
        return await this._model.findOne({gatewayPaymentId:paymentId});
    }

    async getByUserId(userId: string): Promise<IPayment[]> {
        return await this._model
            .find({ userId })
            .populate("photographerId", "name email phone")
            .populate("bookingId", "events status paymentStatus")
            .populate("quotationId", "quotationNumber total advanceAmount")
            .sort({ createdAt: -1 })
            .exec();
    }

    async getByPhotographerId(photographerId: string): Promise<IPayment[]> {
        return await this._model
            .find({ photographerId })
            .populate("userId", "name email phone")
            .populate("bookingId", "events status paymentStatus")
            .populate("quotationId", "quotationNumber total advanceAmount")
            .sort({ createdAt: -1 })
            .exec();
    }
}
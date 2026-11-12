import type { IPayment } from "../../../shared/interfaces/IPayment";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";


export interface IPaymentRepository extends IBaseRepository<IPayment>{
    findByGatewayOrderId(orderId:string):Promise<IPayment | null>;
    findByGatewayPaymentId(paymentId:string):Promise<IPayment | null>;
    findByBookingId(bookingId:string):Promise<IPayment[]>;
    getByUserId(userId:string):Promise<IPayment[]>;
    getByPhotographerId(photographerId:string):Promise<IPayment[]>;
}
import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";

export interface IQuotationRepository extends IBaseRepository<IQuotation>{
    findByBookingId(bookingId:string):Promise<IQuotation[]>;
    findByIdAndPhotographer(quotationId:string,photographerId:string):Promise<IQuotation | null>;
    findByIdAndUser(quotationId:string,userId:string):Promise<IQuotation | null>;
    findByUserId(userId:string):Promise<IQuotation[] | null>;
    findByPhotographerId(photographerId:string):Promise<IQuotation[] | null>;
}
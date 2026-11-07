import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import { Quotation } from "../../../shared/models/quotation.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IQuotationRepository } from "../interfaces/IQuotationRepository";


export class QuotationRepository extends BaseRepository<IQuotation> implements IQuotationRepository{
    constructor(){
        super(Quotation)
    }
    async findByBookingId(bookingId: string): Promise<IQuotation[]> {
        return await this._model.find({bookingId}).sort({createdAt:-1}).exec();
    }
    async findByIdAndPhotographer(quotationId: string, photographerId: string): Promise<IQuotation | null> {
        return await this._model.findOne({_id:quotationId,photographerId}).exec();
    }
    async findByIdAndUser(quotationId: string, userId: string): Promise<IQuotation | null> {
        return await this._model.findOne({_id:quotationId,userId}).exec();
    }
    async findByPhotographerId(photographerId: string): Promise<IQuotation[] | null> {
        return await this._model.find({photographerId}).sort({createdAt:-1}).exec();
    }
    async findByUserId(userId: string): Promise<IQuotation[] | null> {
        return await this._model.find({userId}).sort({created:-1}).exec();
    }
}

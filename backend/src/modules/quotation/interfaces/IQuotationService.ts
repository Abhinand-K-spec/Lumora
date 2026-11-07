
import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import type { CreateQuotationDTO } from "../dto/createQuotationDto";

export interface IQuotationService {
  createDraft(
    photographerId: string,
    bookingId: string,
    data: CreateQuotationDTO,
  ): Promise<IQuotation>;
  updateQuotation(
    photographerId:string,
    quotationId:string,
    data:CreateQuotationDTO
  ):Promise<IQuotation>;
  sendQuotation(
    photographerId:string,
    quotationId:string
  ):Promise<IQuotation>;
  acceptQuotation(
    quotationId:string,
    customerId:string,
  ):Promise<IQuotation>;
  rejectQuotation(
    quotationId:string,
    customerId:string,
    reason:string
  ):Promise<IQuotation>;
  getQuotationByBooking(
    requesterId:string,
    bookingId:string
  ):Promise<IQuotation[]>;
  getQuotationById(
    requesterId:string,
    quotationId:string,
  ):Promise<IQuotation>;
  getPhotographerQuotations(
    photographerId:string,
  ):Promise<IQuotation[]>;
  getUserQuotations(
    userId:string,
  ):Promise<IQuotation[]>;
}
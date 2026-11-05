
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
}
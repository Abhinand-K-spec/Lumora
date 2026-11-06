import { Types } from "mongoose";

import {
  AUTH_MESSAGES,
  BOOKING_MESSAGES,
  QUOTATION_MESSAGES,
} from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";

import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository";
import type { IQuotationRepository } from "../interfaces/IQuotationRepository";
import type { IQuotationService } from "../interfaces/IQuotationService";
import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import type { CreateQuotationDTO } from "../dto/createQuotationDto";
import { calculateQuotation } from "../utils/QuotationFinanceCalculator";

export class QuotationService implements IQuotationService {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _quotationRepository: IQuotationRepository
  ) {}

  async createDraft(
    photographerId: string,
    bookingId: string,
    data: CreateQuotationDTO
  ): Promise<IQuotation> {
    const booking = await this._bookingRepository.findById(bookingId);

    if (!booking) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        BOOKING_MESSAGES.BOOKING_NOT_FOUND
      );
    }

    if (booking.photographerId.toString() !== photographerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (booking.status !== "ACCEPTED") {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.BOOKING_NOT_ACCEPTED
      );
    }

    if (data.items.length < 1) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        QUOTATION_MESSAGES.NO_QUOTATION_ITEM
      );
    }

    const validUntil = new Date(data.validUntil);

    if (Number.isNaN(validUntil.getTime) || validUntil.getTime() < Date.now()) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.INVALID_DATE
      );
    }

    const calculated = calculateQuotation(data);

    const quotationPayload: Partial<IQuotation> = {
      bookingId: new Types.ObjectId(bookingId),
      userId: booking.userId,
      photographerId: new Types.ObjectId(photographerId),
      quotationNumber: `QUO-${Date.now()}`,
      ...calculated,
      ...(data.notes !== undefined && {
        notes: data.notes,
      }),
      validUntil,
      status: "DRAFT",
    };

    return await this._quotationRepository.create(quotationPayload);
  }

  async updateQuotation(photographerId: string, quotationId: string, data: CreateQuotationDTO): Promise<IQuotation> {
    if(!photographerId){
      throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
    };

    if(!quotationId){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_FOUND);
    };

    const quotation = await this._quotationRepository.findByIdAndPhotographer(quotationId,photographerId);

    if(quotation?.status !== 'DRAFT'){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_DRAFTED_QUOTATION);
    };

    const validUntil = new Date(data.validUntil);

    if(validUntil.getTime()< Date.now()){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.INVALID_DATE);
    };

    const calculated = calculateQuotation(data);

    if(calculated.discount>calculated.subtotal){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.DISCOUNT_MUST_NOT_EXCEED);
    };

    if(calculated.advanceAmount>calculated.subtotal){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.ADVANCE_MUST_NOT_EXCEED)
    };

    const updated = await this._quotationRepository.update(quotationId,{
      ...calculated,
      validUntil,
      ...(data.notes!==undefined && {
        notes:data.notes
      }),

    })

    if(!updated){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_FOUND)
    }
    return updated;
  }

  async sendQuotation(photographerId: string, quotationId: string): Promise<IQuotation> {
    const quotation = await this._quotationRepository.findByIdAndPhotographer(quotationId,photographerId);

    if(!quotation){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_FOUND);
    };

    if(quotation.status !== 'DRAFT'){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_DRAFTED_QUOTATION);
    };

    if(new Date(quotation.validUntil) <= new Date()){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.INVALID_DATE)
    };

    const updatedQuotation = await this._quotationRepository.update(quotationId,{status:'SENT',submittedAt:new Date()});

    if(!updatedQuotation){
      throw new AppError(HttpStatus.BAD_REQUEST,QUOTATION_MESSAGES.NOT_FOUND);
    }

    return updatedQuotation;
  }
  
}

import { Types } from "mongoose";

import {
  AUTH_MESSAGES,
  BOOKING_MESSAGES,
  NOTIFICATION_MESSAGES,
  QUOTATION_MESSAGES,
} from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";

import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository";
import type { IQuotationRepository } from "../interfaces/IQuotationRepository";
import type { IQuotationService } from "../interfaces/IQuotationService";
import type { IQuotation } from "../../../shared/interfaces/IQuotation";
import type { CreateQuotationDTO } from "../dto/createQuotationDto";
import type { INotificationService } from "../../notification/interfaces/INotificationService";
import { calculateQuotation } from "../utils/QuotationFinanceCalculator";

export class QuotationService implements IQuotationService {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _quotationRepository: IQuotationRepository,
    private readonly _notificationService: INotificationService,
  ) { }

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
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.NO_QUOTATION_ITEM
      );
    }

    const validUntil = new Date(data.validUntil);

    if (Number.isNaN(validUntil.getTime()) || validUntil.getTime() < Date.now()) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.INVALID_DATE
      );
    }

    const calculated = calculateQuotation(data);

    if (calculated.discount > calculated.subtotal) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.DISCOUNT_MUST_NOT_EXCEED
      );
    }

    if (calculated.advanceAmount > calculated.total) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        QUOTATION_MESSAGES.ADVANCE_MUST_NOT_EXCEED
      );
    }

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
    if (!photographerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    };

    if (!quotationId) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    const quotation = await this._quotationRepository.findByIdAndPhotographer(quotationId, photographerId);

    if (quotation?.status !== 'DRAFT') {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_DRAFTED_QUOTATION);
    };

    const validUntil = new Date(data.validUntil);

    if (validUntil.getTime() < Date.now()) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.INVALID_DATE);
    };

    const calculated = calculateQuotation(data);

    if (calculated.discount > calculated.subtotal) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.DISCOUNT_MUST_NOT_EXCEED);
    };

    if (calculated.advanceAmount > calculated.total) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.ADVANCE_MUST_NOT_EXCEED)
    };

    const updated = await this._quotationRepository.update(quotationId, {
      ...calculated,
      validUntil,
      ...(data.notes !== undefined && {
        notes: data.notes
      }),

    })

    if (!updated) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND)
    }
    return updated;
  }

  async sendQuotation(photographerId: string, quotationId: string): Promise<IQuotation> {
    const quotation = await this._quotationRepository.findByIdAndPhotographer(quotationId, photographerId);

    if (!quotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    if (quotation.status !== 'DRAFT') {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_DRAFTED_QUOTATION);
    };

    if (new Date(quotation.validUntil) <= new Date()) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.INVALID_DATE)
    };

    const updatedQuotation = await this._quotationRepository.update(quotationId, { status: 'SENT', submittedAt: new Date() });

    if (!updatedQuotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    }

    await this._notificationService.createNotification({
      recipientId: updatedQuotation.userId as Types.ObjectId,
      actorId: new Types.ObjectId(photographerId),
      type: 'QUOTATION_RECEIVED',
      title: NOTIFICATION_MESSAGES.QUOTATION.RECEIVED,
      message: 'You have received a new quotation. Review and respond.',
      resourceType: 'QUOTATION',
      resourceId: updatedQuotation.bookingId as Types.ObjectId,
    });

    return updatedQuotation;
  }

  async acceptQuotation(quotationId: string, customerId: string): Promise<IQuotation> {
    const quotation = await this._quotationRepository.findById(quotationId);

    if (!quotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    if (quotation.userId.toString() !== customerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    };

    if (quotation.status !== 'SENT') {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_SENT_QUOTATION);
    };

    if (new Date(quotation.validUntil) <= new Date()) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.DATE_EXPIRED)
    };

    const updatedQuotation = await this._quotationRepository.update(quotationId, { status: 'ACCEPTED', respondedAt: new Date() });

    if (!updatedQuotation) {
      throw new AppError(HttpStatus.NOT_FOUND, QUOTATION_MESSAGES.NOT_FOUND);
    };

    await this._notificationService.createNotification({
      recipientId: updatedQuotation.photographerId as Types.ObjectId,
      actorId: updatedQuotation.userId as Types.ObjectId,
      type: 'QUOTATION_ACCEPTED',
      title: NOTIFICATION_MESSAGES.QUOTATION.ACCEPTED,
      message: 'The client has accepted your quotation.',
      resourceType: 'QUOTATION',
      resourceId: updatedQuotation.bookingId as Types.ObjectId,
    });

    return updatedQuotation;
  }


  async rejectQuotation(quotationId: string, customerId: string, reason: string): Promise<IQuotation> {
    const quotation = await this._quotationRepository.findById(quotationId);

    if (!quotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    if (quotation.userId.toString() !== customerId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    };

    if (new Date(quotation.validUntil) <= new Date()) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.DATE_EXPIRED);

    }

    if (!reason || !reason.trim()) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.REJECTION_REASON_NEEDED);
    }

    const updatedQuotation = await this._quotationRepository.update(quotationId, { status: 'REJECTED', respondedAt: new Date(), rejectionReason: reason })

    if (!updatedQuotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    await this._notificationService.createNotification({
      recipientId: updatedQuotation.photographerId as Types.ObjectId,
      actorId: updatedQuotation.userId as Types.ObjectId,
      type: 'QUOTATION_REJECTED',
      title: NOTIFICATION_MESSAGES.QUOTATION.REJECTED,
      message: `The client has declined your quotation. Reason: "${reason.trim()}"`,
      resourceType: 'QUOTATION',
      resourceId: updatedQuotation.bookingId as Types.ObjectId,
    });

    return updatedQuotation;
  };

  async getQuotationByBooking(requesterId: string, bookingId: string): Promise<IQuotation[]> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    };

    const isUser = booking.userId.toString() === requesterId;
    const isPhotographer = booking.photographerId.toString() === requesterId;

    if (!isUser && !isPhotographer) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    };

    const quotation = await this._quotationRepository.findByBookingId(bookingId);
    if (!quotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };
    return quotation;
  }

  async getQuotationById(requesterId: string, quotationId: string): Promise<IQuotation> {

    if (!quotationId) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    const quotation = await this._quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
    };

    const isUser = quotation?.userId.toString() === requesterId;
    const isPhotographer = quotation?.photographerId.toString() === requesterId;

    if (!isPhotographer && !isUser) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    };

    return quotation;
  }


  async getPhotographerQuotations(photographerId: string): Promise<IQuotation[]> {
    const quotations = await this._quotationRepository.findByPhotographerId(photographerId);
    return quotations ?? [];
  }
  async getUserQuotations(userId: string): Promise<IQuotation[]> {
    const quotations = await this._quotationRepository.findByUserId(userId);
    return quotations ?? [];
  }

}

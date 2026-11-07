import type { Request, Response } from "express";
import type { IQuotationService } from "../interfaces/IQuotationService";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AUTH_MESSAGES, BOOKING_MESSAGES, QUOTATION_MESSAGES } from "../../../shared/constants/message.constant";
import type { CreateQuotationDTO } from "../dto/createQuotationDto";
import { sendSuccess } from "../../../shared/utils/response.utils";

export class QuotationController {
  constructor(private readonly _quotationService: IQuotationService) {}

    async createDraft(req: Request, res: Response): Promise<void> {
        const photographerId = req.user?.id;
        const bookingId = req.params.id?.toString();

        if (!photographerId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

    if (!bookingId) {
      throw new AppError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    }

        const data = req.body as CreateQuotationDTO;

        const quotation = await this._quotationService.createDraft(photographerId, bookingId, data);

        sendSuccess(res, quotation, QUOTATION_MESSAGES.QUOTATION_DRAFTED);

    }

    async updateQuotation(req: Request, res: Response): Promise<void> {
        const photographerId = req.user?.id;

        if (!photographerId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        const quotationId = req.params?.id

        if (!quotationId) {
            throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
        };

        const data = req.body as CreateQuotationDTO;

        const updated = await this._quotationService.updateQuotation(photographerId, quotationId.toString(), data);

        sendSuccess(res, updated, QUOTATION_MESSAGES.QUOTATION_STATUS_CHANGED);
    }

    async sendQuotation(req: Request, res: Response): Promise<void> {
        const photographerId = req.user?.id;
        const quotationId = req.params?.id?.toString()
        if (!photographerId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        if (!quotationId) {
            throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND)
        }

        const updated = await this._quotationService.sendQuotation(photographerId, quotationId)

        sendSuccess(res, updated, QUOTATION_MESSAGES.QUOTATION_STATUS_CHANGED);
    }

    async acceptQuotation(req: Request, res: Response): Promise<void> {
        const customerId = req.user?.id;
        const quotationId = req.params?.id?.toString();
        if (!customerId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        if (!quotationId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        const updated = await this._quotationService.acceptQuotation(quotationId, customerId);

        if (!updated) {
            throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
        };

        sendSuccess(res, updated, QUOTATION_MESSAGES.QUOTATION_STATUS_CHANGED);
    };

    async rejectQuotation(req: Request, res: Response): Promise<void> {
        const customerId = req.user?.id;
        const quotationId = req.params?.id?.toString();
        const { reason } = req.body as { reason: string };

        if (!customerId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        if (!quotationId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };


        const updated = await this._quotationService.rejectQuotation(quotationId, customerId, reason);

        if (!updated) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        sendSuccess(res, updated, QUOTATION_MESSAGES.QUOTATION_STATUS_CHANGED);
    };


    async getquotationByBooking(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id;
        const bookingId = req.params?.id?.toString();

        if (!userId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        if (!bookingId) {
            throw new AppError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
        };

        const quotation = await this._quotationService.getQuotationByBooking(userId, bookingId);

        sendSuccess(res, quotation, QUOTATION_MESSAGES.QUOTATION_FETCHED);

    }

    async getQuoatationById(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id;
        const quotationId = req.params?.id?.toString();

        if (!userId) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        };

        if (!quotationId) {
            throw new AppError(HttpStatus.BAD_REQUEST, QUOTATION_MESSAGES.NOT_FOUND);
        };

        const quotation = await this._quotationService.getQuotationById(userId, quotationId);

        sendSuccess(res, quotation, QUOTATION_MESSAGES.QUOTATION_FETCHED);
    }

    async getPhotographerQuotations(req:Request,res:Response):Promise<void>{
        const photographerId = req.user?.id;
        if(!photographerId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };
        const quotations = await this._quotationService.getPhotographerQuotations(photographerId);
        sendSuccess(res,quotations,QUOTATION_MESSAGES.QUOTATION_FETCHED);
    }
    async getUserQuotations(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };
        const quotations = await this._quotationService.getUserQuotations(userId);
        sendSuccess(res,quotations,QUOTATION_MESSAGES.QUOTATION_FETCHED);
    }

}

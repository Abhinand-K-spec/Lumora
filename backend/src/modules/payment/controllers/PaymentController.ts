
import type { Request, Response } from "express";
import type { IPaymentService } from "../interfaces/IPaymentService.js";
import type { VerifyAdvancePaymentDTO } from "../dtos/verifyAdvancePaymentDto";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import { AUTH_MESSAGES, PAYMENT_MESSAGES } from "../../../shared/constants/message.constant";
import { sendSuccess } from "../../../shared/utils/response.utils.js";

export class PaymentController {
  constructor(
    private readonly _paymentService: IPaymentService
  ) {}

  async createAdvanceOrder(
    req: Request,
    res: Response,
  ): Promise<void> {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
      };

      const { quotationId } = req.body;

      const result = await this._paymentService.createAdvanceOrder(
        userId,
        quotationId
      );

      sendSuccess(res,result,PAYMENT_MESSAGES.PAYMENT_ORDER_CREATED);
    
  }

  async verifyAdvancePayment(
    req: Request,
    res: Response,
  ): Promise<void> {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
      }

      const paymentData = req.body as VerifyAdvancePaymentDTO;

      const result = await this._paymentService.verifyAdvancePayment(
        userId,
        paymentData
      );

      sendSuccess(res,result,PAYMENT_MESSAGES.PAYMENT_VERIFIED);
  }

  async getUserPayments(req:Request,res:Response):Promise<void>{
    const userId = req.user?.id;
    if(!userId){
      throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
    };

    const result = await this._paymentService.getUserPayments(userId);
    sendSuccess(res,result,PAYMENT_MESSAGES.PAYMENTS_FETCHED);
  }

  async getPhotographerPayments(req:Request,res:Response):Promise<void>{
    const photographerId = req.user?.id;
    if(!photographerId){
      throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
    };

    const result = await this._paymentService.getPhotographerPayments(photographerId);
    sendSuccess(res,result,PAYMENT_MESSAGES.PAYMENTS_FETCHED);
  }
}

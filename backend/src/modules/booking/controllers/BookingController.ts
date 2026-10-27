import type { Request, Response } from "express";
import type { IBookingService } from "../interfaces/IBookingService";
import { sendSuccess } from "../../../shared/utils/response.utils";
import { AUTH_MESSAGES, BOOKING_MESSAGES } from "../../../shared/constants/message.constant";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import type { BookingStatus } from "../../../shared/interfaces/IBooking";

export class BookingController{
    constructor(private readonly _bookingService:IBookingService){}

    async createBooking(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;

        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED)
        }

        const booking = await this._bookingService.createBooking(userId,req.body);

        sendSuccess(res,{booking},BOOKING_MESSAGES.BOOKING_CREATED)
    }


    async getUserBookings(req:Request,res:Response):Promise<void>{
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };

        const bookings = await this._bookingService.getUserBookings(userId);

        sendSuccess(res,{bookings},BOOKING_MESSAGES.BOOKINGS_FETCHED);
    }

    async getPhotographerBookings(req:Request,res:Response):Promise<void>{
        const photographerId = req.user?.id;
        if(!photographerId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED)
        }

        const bookings = await this._bookingService.getPhotographerBookings(photographerId);

        sendSuccess(res,{bookings},BOOKING_MESSAGES.BOOKINGS_FETCHED);
    }

    async updateStatus(req:Request,res:Response):Promise<void>{
        const actorId = req.user?.id;
        if(!actorId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED)
        }

        const { id } = req.params;
        const { status, reason } = req.body;

        const updated =
        await this._bookingService.updateBookingStatus(
          id as string,
          status as BookingStatus,
          actorId,
          reason
        );

    
        sendSuccess(res,{updated},BOOKING_MESSAGES.BOOKING_STATUS_UPDATED);
    }

    

}
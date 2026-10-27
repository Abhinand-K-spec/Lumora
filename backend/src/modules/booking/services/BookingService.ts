import { Types } from "mongoose";
import { AUTH_MESSAGES, BOOKING_MESSAGES } from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import type { CreateBookingDTO } from "../dto/CreateBookingDto";
import type { IBookingRepository } from "../interfaces/IBookingRepository";
import type { IBookingService } from "../interfaces/IBookingService";

export class BookingService implements IBookingService {
  constructor(private readonly _bookingRepository: IBookingRepository) {}
  async createBooking(
    userId: string,
    data: CreateBookingDTO
  ): Promise<IBooking> {
    const eventDate = new Date(data.eventDate);
    if (eventDate.getTime() <= Date.now()) {
      throw new AppError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.DATE_INVALID);
    }
    const { photographerId, packageId, eventType, location, notes, totalPrice } = data;

    const bookingPayload: Partial<IBooking> = {
      userId: new Types.ObjectId(userId),
      photographerId: new Types.ObjectId(photographerId),
      eventType,
      eventDate,
      status: "PENDING",
      location,
      notes,
      totalPrice,
    };

    if (packageId) {
      bookingPayload.packageId = new Types.ObjectId(packageId);
    }

    return await this._bookingRepository.create(bookingPayload);
  }
  async getUserBookings(userId: string): Promise<IBooking[]> {
    return await this._bookingRepository.findByUserId(userId);
  }
  async getPhotographerBookings(photographerId: string): Promise<IBooking[]> {
    return await this._bookingRepository.findByPhotographerId(photographerId);
  }
  async updateBookingStatus(bookingId: string, status: BookingStatus, actorId: string, reason?: string): Promise<IBooking> {
      const booking = await this._bookingRepository.findById(bookingId);
      if(!booking){
        throw new AppError(HttpStatus.NOT_FOUND,BOOKING_MESSAGES.BOOKING_NOT_FOUND);
      };
      if(status === 'ACCEPTED' || status === 'REJECTED'){
        if(booking.photographerId.toString() !== actorId){
            throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
        };

    }
        if(status === 'CANCELLED'){
            if(booking.userId.toString() !== actorId){
                throw new AppError(HttpStatus.UNAUTHORIZED,AUTH_MESSAGES.UNAUTHORIZED);
            };

        }
      const updated = await this._bookingRepository.updateStatus(bookingId, status, reason);
    return updated!;
  }
}

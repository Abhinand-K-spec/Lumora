import { Types } from "mongoose";
import {
  AUTH_MESSAGES,
  BOOKING_MESSAGES,
  NOTIFICATION_MESSAGES,
} from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type {
  BookingStatus,
  IBooking,
} from "../../../shared/interfaces/IBooking";
import type { CreateBookingDTO } from "../dto/CreateBookingDto";
import type {
  BookingQueryOptions,
  IBookingRepository,
  PaginatedBookings,
} from "../interfaces/IBookingRepository";
import type { IBookingService } from "../interfaces/IBookingService";
import type { INotificationService } from "../../notification/interfaces/INotificationService";

export class BookingService implements IBookingService {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _notificationService:INotificationService
  ) {}
  async createBooking(
    userId: string,
    data: CreateBookingDTO
  ): Promise<IBooking> {
    const { photographerId, packageId, events, notes } = data;

    if (!events || events.length === 0) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "At least one event is required"
      );
    }

    const parsedEvents = events.map((ev) => {
      const eventDate = new Date(ev.eventDate);
      if (eventDate.getTime() <= Date.now()) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          BOOKING_MESSAGES.DATE_INVALID
        );
      }
      return {
        eventType: ev.eventType,
        eventDate,
        location: ev.location,
      };
    });

    const eventDates = parsedEvents.map((e) => e.eventDate);
    const conflict = await this._bookingRepository.findConflict(
      photographerId,
      eventDates
    );
    if (conflict) {
      throw new AppError(
        HttpStatus.CONFLICT,
        "Photographer already has a booking or pending request on one of the selected dates"
      );
    }

    const bookingPayload: Partial<IBooking> = {
      userId: new Types.ObjectId(userId),
      photographerId: new Types.ObjectId(photographerId),
      events: parsedEvents,
      status: "PENDING",
      notes,
    };

    if (packageId) {
      bookingPayload.packageId = new Types.ObjectId(packageId);
    }
    const booking = await this._bookingRepository.create(bookingPayload);
  

    await this._notificationService.createNotification({
      recipientId:new Types.ObjectId(photographerId),
      actorId:new Types.ObjectId(userId),
      type:'BOOKING_CREATED',
      title:NOTIFICATION_MESSAGES.BOOKING.CREATED,
      message:'You have recieved a new booking',
      resourceType:'BOOKING'
    })

    return booking
  }
  async getUserBookings(
    userId: string,
    options?: BookingQueryOptions
  ): Promise<PaginatedBookings> {
    return await this._bookingRepository.findByUserId(userId, options);
  }
  async getPhotographerBookings(
    photographerId: string,
    options?: BookingQueryOptions
  ): Promise<PaginatedBookings> {
    return await this._bookingRepository.findByPhotographerId(
      photographerId,
      options
    );
  }
  async getPhotographerBookingDetails(photographerId:string,bookingId: string): Promise<IBooking | null> {
    const booking =  await this._bookingRepository.findByBookingId(photographerId,bookingId);
    return booking;
  }
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    actorId: string,
    reason?: string
  ): Promise<IBooking> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        BOOKING_MESSAGES.BOOKING_NOT_FOUND
      );
    }
    if (status === "ACCEPTED" || status === "REJECTED") {
      if (booking.photographerId.toString() !== actorId) {
        throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
      }
    }
    if (status === "CANCELLED") {
      if (booking.userId.toString() !== actorId) {
        throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
      }
    }
    const updated = await this._bookingRepository.updateStatus(
      bookingId,
      status,
      reason
    );
    if (!updated) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        BOOKING_MESSAGES.BOOKING_NOT_FOUND
      );
    }
    
    if (status === "ACCEPTED" || status === "REJECTED") {
      await this._notificationService.createNotification({
        recipientId: booking.userId,
        actorId: new Types.ObjectId(booking.packageId),
        type:
          status === "ACCEPTED"
            ? "BOOKING_ACCEPTED"
            : "BOOKING_REJECTED",
        title:
          status === "ACCEPTED"
            ? NOTIFICATION_MESSAGES.BOOKING.ACCEPTED
            : NOTIFICATION_MESSAGES.BOOKING.REJECTED,
        message:
          status === "ACCEPTED"
            ? "Your booking request has been accepted."
            : "Your booking request has been rejected.",
        resourceType: "BOOKING",
      });
    }
    if (status === "CANCELLED") {
      await this._notificationService.createNotification({
        recipientId: booking.photographerId,
        actorId: booking.userId,
        type: "BOOKING_CANCELLED",
        title: NOTIFICATION_MESSAGES.BOOKING.CANCELLED,
        message: "A booking has been cancelled by the user.",
        resourceType: "BOOKING",
      });
    }
    
    return updated;
  }
}

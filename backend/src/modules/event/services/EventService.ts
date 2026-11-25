import { randomBytes } from "node:crypto";
import {
  AUTH_MESSAGES,
  BOOKING_MESSAGES,
  EVENT_MESSAGES,
} from "../../../shared/constants/message.constant";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AppError } from "../../../shared/errors/AppError";
import type { IEvent } from "../../../shared/interfaces/iEvent";
import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository";
import type { IPaymentRepository } from "../../payment/interfaces/IPaymentRepository";
import type { CreateEventDTO, UpdateEventDTO } from "../dtos/createEventDto";
import type { IEventRepository } from "../interfaces/IEventRepository";
import type { IEventService } from "../interfaces/IEventService";

export class EventService implements IEventService {
  constructor(
    private readonly _eventRepository: IEventRepository,
    private readonly _bookingRepository: IBookingRepository,
    private readonly _paymentRepository: IPaymentRepository
  ) {}

  async createEvent(
    photographerId: string,
    data: CreateEventDTO
  ): Promise<IEvent> {
    const booking = await this._bookingRepository.findById(data.bookingId);

    if (!booking) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        BOOKING_MESSAGES.BOOKING_NOT_FOUND
      );
    }

    if (booking.photographerId.toString() !== photographerId) {
      throw new AppError(HttpStatus.FORBIDDEN, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (booking.status !== "ACCEPTED") {
      throw new AppError(HttpStatus.BAD_REQUEST, EVENT_MESSAGES.NOT_ACCEPTED);
    }

    const existingEvent = await this._eventRepository.findByBookingId(
      data.bookingId
    );

    if (existingEvent) {
      throw new AppError(HttpStatus.CONFLICT, EVENT_MESSAGES.EVENT_EXISTING);
    }

    const payments = await this._paymentRepository.findByBookingId(
      data.bookingId
    );

    const successfulAdvancePayment = payments.find(
      (payment) =>
        payment.paymentType === "ADVANCE" && payment.status === "SUCCESS"
    );

    if (!successfulAdvancePayment) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        EVENT_MESSAGES.ADVANCE_PAYMENT_NOT_SUCCESS
      );
    }

    const eventName = data.name.trim();

    if (!eventName) {
      throw new AppError(HttpStatus.BAD_REQUEST, EVENT_MESSAGES.NO_NAME);
    }
    const programs = booking.events.map((event) => ({
      name: event.eventType,
      date: event.eventDate,
      ...(event.location && { location: event.location }),
      ...(event.coordinates && { coordinates: event.coordinates }),
    }));

    const publicId = randomBytes(16).toString("hex");

    const eventPayload: Partial<IEvent> = {
      bookingId: booking._id!,
      photographerId: booking.photographerId,
      userId: booking.userId,
      name: eventName,
      ...(data.description?.trim() && {
        description: data.description.trim(),
      }),
      programs,
      publicId,
      status: "UPCOMING",
    };

    const createdEvent = await this._eventRepository.create(eventPayload);

    return createdEvent;
  }

  async getPhotographerEvents(photographerId: string): Promise<IEvent[]> {
    return await this._eventRepository.findByPhotographerId(photographerId);
  }

  async getEventById(eventId: string, photographerId: string): Promise<IEvent> {
    const event = await this._eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(HttpStatus.NOT_FOUND, EVENT_MESSAGES.NOT_FOUND);
    }

    if (event.photographerId.toString() !== photographerId) {
      throw new AppError(HttpStatus.FORBIDDEN, AUTH_MESSAGES.UNAUTHORIZED);
    }

    return event;
  }

  async getEventByBookingId(
    bookingId: string,
    photographerId: string
  ): Promise<IEvent | null> {
    const event = await this._eventRepository.findByBookingId(bookingId);

    if (!event) {
      return null;
    }

    if (event.photographerId.toString() !== photographerId) {
      throw new AppError(HttpStatus.FORBIDDEN, AUTH_MESSAGES.UNAUTHORIZED);
    }

    return event;
  }

  async getPublicEvent(publicId: string): Promise<IEvent> {
    const event = await this._eventRepository.findByPublicId(publicId);

    if (!event) {
      throw new AppError(HttpStatus.NOT_FOUND, EVENT_MESSAGES.NOT_FOUND);
    }

    if (event.status === "CANCELLED") {
      throw new AppError(HttpStatus.NOT_FOUND, EVENT_MESSAGES.NOT_AVAILABLE);
    }

    return event;
  }

  async updateEvent(
    eventId: string,
    photographerId: string,
    data: UpdateEventDTO
  ): Promise<IEvent> {
    const event = await this.getEventById(eventId, photographerId);

    const updatedEvent = await this._eventRepository.update(
      event._id!.toString(),
      {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),
        ...(data.description !== undefined && {
          description: data.description.trim(),
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      }
    );

    if (!updatedEvent) {
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        EVENT_MESSAGES.UNABLE_TO_UPDATE
      );
    }

    return updatedEvent;
  }
}

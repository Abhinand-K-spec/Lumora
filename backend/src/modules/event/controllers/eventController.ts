import type { Request, Response } from "express";

import type { IEventService } from "../interfaces/IEventService";
import type { CreateEventDTO,UpdateEventDTO } from "../dtos/createEventDto";

import { sendSuccess } from "../../../shared/utils/response.utils";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AUTH_MESSAGES, EVENT_MESSAGES } from "../../../shared/constants/message.constant";

export class EventController {
  constructor(private readonly _eventService: IEventService) {}

  async createEvent(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;

    if (!photographerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const data = req.body as CreateEventDTO;

    const event = await this._eventService.createEvent(
      photographerId,
      data
    );

    sendSuccess(res, { event }, EVENT_MESSAGES.EVENT_CREATED);
  }

  async getPhotographerEvents(
    req: Request,
    res: Response
  ): Promise<void> {
    const photographerId = req.user?.id;

    if (!photographerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    const events =
      await this._eventService.getPhotographerEvents(photographerId);

    sendSuccess(res, { events },EVENT_MESSAGES.EVENTS_FETCHED);
  }

  async getEventById(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;
    const eventId = req.params.id?.toString();

    if (!photographerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    if (!eventId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        EVENT_MESSAGES.ID_REQUIRED
      );
    }

    const event = await this._eventService.getEventById(
      eventId,
      photographerId
    );

    sendSuccess(res, { event }, EVENT_MESSAGES.EVENTS_FETCHED);
  }

  async getPublicEvent(req: Request, res: Response): Promise<void> {
    const publicId = req.params.publicId?.toString();

    if (!publicId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
       EVENT_MESSAGES.ID_REQUIRED
      );
    }

    const event = await this._eventService.getPublicEvent(publicId);

    sendSuccess(res, { event }, EVENT_MESSAGES.PUBLIC_EVENT_FETCHED);
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    const photographerId = req.user?.id;
    const eventId = req.params.id?.toString();

    if (!photographerId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        AUTH_MESSAGES.UNAUTHORIZED
      );
    }

    if (!eventId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        EVENT_MESSAGES.ID_REQUIRED
      );
    }

    const data = req.body as UpdateEventDTO;

    const updatedEvent = await this._eventService.updateEvent(
      eventId,
      photographerId,
      data
    );

    sendSuccess(
      res,
      { updatedEvent },
      EVENT_MESSAGES.EVENT_UPDATED
    );
  }
}
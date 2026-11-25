import type { IEvent } from "../../../shared/interfaces/iEvent.js";
import type { CreateEventDTO } from "../dtos/createEventDto.js";
import type { UpdateEventDTO } from "../dtos/createEventDto.js";

export interface IEventService {
  createEvent(
    photographerId: string,
    data: CreateEventDTO
  ): Promise<IEvent>;

  getPhotographerEvents(
    photographerId: string
  ): Promise<IEvent[]>;

  getEventById(
    eventId: string,
    photographerId: string
  ): Promise<IEvent>;

  getPublicEvent(
    publicId: string
  ): Promise<IEvent>;

  updateEvent(
    eventId: string,
    photographerId: string,
    data: UpdateEventDTO
  ): Promise<IEvent>;
}
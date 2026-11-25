import api from "../api/axios";
import API_ENDPOINTS from "../constants/apiEndpoints";

import type {
  EventItem,
  CreateEventPayload,
  UpdateEventPayload,
} from "../types/event.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const eventService = {
  createEvent: (payload: CreateEventPayload) =>
    api.post<ApiResponse<{ event: EventItem }>>(
      API_ENDPOINTS.EVENTS.BASE,
      payload
    ),

  getPhotographerEvents: () =>
    api.get<ApiResponse<{ events: EventItem[] }>>(
      API_ENDPOINTS.EVENTS.PHOTOGRAPHER
    ),

  getEventById: (eventId: string) =>
    api.get<ApiResponse<{ event: EventItem }>>(
      API_ENDPOINTS.EVENTS.BY_ID(eventId)
    ),

  getEventByBookingId: (bookingId: string) =>
    api.get<ApiResponse<{ event: EventItem | null }>>(
      API_ENDPOINTS.EVENTS.BY_BOOKING(bookingId)
    ),

  getPublicEvent: (publicId: string) =>
    api.get<ApiResponse<{ event: EventItem }>>(
      API_ENDPOINTS.EVENTS.PUBLIC(publicId)
    ),

  updateEvent: (eventId: string, payload: UpdateEventPayload) =>
    api.patch<ApiResponse<{ updatedEvent: EventItem }>>(
      API_ENDPOINTS.EVENTS.BY_ID(eventId),
      payload
    ),
};

export default eventService;
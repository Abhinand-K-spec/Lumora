
import api from "../api/axios";

export interface BookingEventItem {
  eventType: string;
  eventDate: string;
  location?: string;
}

export interface CreateBookingPayload {
  photographerId: string;
  packageId?: string;
  events: BookingEventItem[];
  notes?: string;
}

export interface BookingItem {
  _id: string;

  userId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  photographerId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  packageId?: {
    _id: string;
    packageName: string;
    price: number;
    description?: string;
  };

  events: BookingEventItem[];

  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";

  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type BookingStatus = BookingItem["status"];

export interface PaginatedBookings {
  bookings: BookingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const bookingService = {
  createBooking: (payload: CreateBookingPayload) =>
    api.post<ApiResponse<{ booking: BookingItem }>>("/bookings", payload),

  getUserBookings: (query?: BookingQuery) =>
    api.get<ApiResponse<PaginatedBookings>>("/bookings/my-bookings", {
      params: query,
    }),

  getPhotographerBookings: (query?: BookingQuery) =>
    api.get<ApiResponse<PaginatedBookings>>(
      "/bookings/photographer-requests",
      { params: query }
    ),

  updateBookingStatus: (
    bookingId: string,
    status: BookingItem["status"],
    reason?: string
  ) =>
    api.patch<ApiResponse<{ updated: BookingItem }>>(
      `/bookings/${bookingId}/status`,
      { status, reason }
    ),
};

export default bookingService;

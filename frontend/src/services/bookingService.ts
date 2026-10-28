import api from "../api/axios";
import API_ENDPOINTS from "../constants/apiEndpoints";

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

  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";

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
    api.post<ApiResponse<{ booking: BookingItem }>>(
      API_ENDPOINTS.BOOKINGS.BASE,
      payload
    ),

  getUserBookings: (query?: BookingQuery) =>
    api.get<ApiResponse<PaginatedBookings>>(
      API_ENDPOINTS.BOOKINGS.MY_BOOKINGS,
      {
        params: query,
      }
    ),

  getBookingById: (bookingId: string) =>
    api.get<ApiResponse<BookingItem>>(API_ENDPOINTS.BOOKINGS.BY_ID(bookingId)),

  getPhotographerBookings: (query?: BookingQuery) =>
    api.get<ApiResponse<PaginatedBookings>>(
      API_ENDPOINTS.BOOKINGS.PHOTOGRAPHER_REQUESTS,
      { params: query }
    ),

  updateBookingStatus: (
    bookingId: string,
    status: BookingItem["status"],
    reason?: string
  ) =>
    api.patch<ApiResponse<{ updated: BookingItem }>>(
      API_ENDPOINTS.BOOKINGS.STATUS(bookingId),
      { status, reason }
    ),
};

export default bookingService;

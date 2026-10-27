
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

  photographerId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  packageId?: {
    _id: string;
    packageName: string;
    price: number;
  };

  events: BookingEventItem[];

  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";

  notes?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const bookingService = {
  createBooking: (payload: CreateBookingPayload) =>
    api.post<ApiResponse<{ booking: BookingItem }>>("/bookings", payload),

  getUserBookings: () =>
    api.get<ApiResponse<{ bookings: BookingItem[] }>>("/bookings/my-bookings"),

  getPhotographerBookings: () =>
    api.get<ApiResponse<{ bookings: BookingItem[] }>>(
      "/bookings/photographer-requests"
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

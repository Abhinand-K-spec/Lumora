
import api from "../api/axios";

export interface CreateBookingPayload {
  photographerId: string;
  packageId?: string;
  eventType: string;
  eventDate: string;
  location?: string;
  notes?: string;
  totalPrice?: number;
}

export interface BookingItem {
  _id: string;

  photographerId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };

  packageId?: {
    _id: string;
    packageName: string;
    price: number;
  };

  eventType: string;
  eventDate: string;

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
    api.post<ApiResponse<BookingItem>>("/bookings", payload),

  getUserBookings: () =>
    api.get<ApiResponse<BookingItem[]>>("/bookings/my-bookings"),

  getPhotographerBookings: () =>
    api.get<ApiResponse<BookingItem[]>>(
      "/bookings/photographer-requests"
    ),

  updateBookingStatus: (
    bookingId: string,
    status: BookingItem["status"],
    reason?: string
  ) =>
    api.patch<ApiResponse<BookingItem>>(
      `/bookings/${bookingId}/status`,
      { status, reason }
    ),
};

export default bookingService;

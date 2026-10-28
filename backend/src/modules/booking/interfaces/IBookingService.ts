import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import type { CreateBookingDTO } from "../dto/CreateBookingDto";
import type { BookingQueryOptions, PaginatedBookings } from "./IBookingRepository";

export interface IBookingService{
    createBooking(userId:string,data:CreateBookingDTO):Promise<IBooking>;
    getUserBookings(userId:string, options?: BookingQueryOptions):Promise<PaginatedBookings>;
    getPhotographerBookings(photographerId:string, options?: BookingQueryOptions):Promise<PaginatedBookings>;
    updateBookingStatus(
        bookingId: string,
        status: BookingStatus,
        actorId: string,
        reason?: string
      ): Promise<IBooking>;
}
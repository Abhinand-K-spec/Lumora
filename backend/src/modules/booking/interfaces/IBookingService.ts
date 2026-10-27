import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import type { CreateBookingDTO } from "../dto/CreateBookingDto";

export interface IBookingService{
    createBooking(userId:string,data:CreateBookingDTO):Promise<IBooking>;
    getUserBookings(userId:string):Promise<IBooking[]>;
    getPhotographerBookings(photographerId:string):Promise<IBooking[]>;
    updateBookingStatus(
        bookingId: string,
        status: BookingStatus,
        actorId: string,
        reason?: string
      ): Promise<IBooking>;
}
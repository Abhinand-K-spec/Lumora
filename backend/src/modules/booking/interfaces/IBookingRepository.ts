import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import type{ IBaseRepository } from "../../../shared/repository/IBaseRepository"


export interface PaginatedBookings {
  bookings: IBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingQueryOptions {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export interface IBookingRepository extends IBaseRepository<IBooking>{
    findByUserId(userId:string, options?: BookingQueryOptions):Promise<PaginatedBookings>;
    findByPhotographerId(photographerId:string, options?: BookingQueryOptions):Promise<PaginatedBookings>;
    findConflict(photographerId: string, eventDates: Date[]): Promise<IBooking | null>;
    updateStatus(id:string,status:BookingStatus,reason?:string):Promise<IBooking|null>;
    findByBookingId(photographerId:string,bookingId:string):Promise<IBooking | null>;
}
import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import type{ IBaseRepository } from "../../../shared/repository/IBaseRepository"



export interface IBookingRepository extends IBaseRepository<IBooking>{
    findByUserId(userId:string):Promise<IBooking[]>;
    findByPhotographerId(photographerId:string):Promise<IBooking[]>;
    findConflict(photographerId: string, eventDates: Date[]): Promise<IBooking | null>;
    updateStatus(id:string,status:BookingStatus,reason?:string):Promise<IBooking|null>;
}
import type { IEvent } from "../../../shared/interfaces/iEvent";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";

export interface IEventRepository extends IBaseRepository<IEvent>{
    findByBookingId(bookingId: string): Promise<IEvent | null>;
  
    findByPublicId(publicId: string): Promise<IEvent | null>;
  
    findByPhotographerId(
      photographerId: string
    ): Promise<IEvent[]>;
  
    delete(id: string): Promise<boolean>;
  }
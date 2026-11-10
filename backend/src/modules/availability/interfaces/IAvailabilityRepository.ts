import type { Types } from "mongoose";
import type { IAvailability } from "../../../shared/interfaces/IAvailability";
import type { IBaseRepository } from "../../../shared/repository/IBaseRepository";

export interface IAvailabilityRepository extends IBaseRepository<IAvailability>{
    findOverlapping(
        photographerId: Types.ObjectId,
        startDate: Date,
        endDate: Date
      ): Promise<IAvailability[]>;
    
      findByPhotographerAndDateRange(
        photographerId: Types.ObjectId,
        startDate: Date,
        endDate: Date
      ): Promise<IAvailability[]>;

      delete(availabilityId:string):Promise<boolean>;
}
import type { Types } from "mongoose";
import type { IAvailability } from "../../../shared/interfaces/IAvailability";
import { AvailabilityModel } from "../../../shared/models/availability.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IAvailabilityRepository } from "../interfaces/IAvailabilityRepository";

export class AvailabilityRepository extends BaseRepository<IAvailability> implements IAvailabilityRepository{
    constructor(){
        super(AvailabilityModel)
    }
    async findOverlapping(
        photographerId: Types.ObjectId,
        startDate: Date,
        endDate: Date
      ): Promise<IAvailability[]> {
        return await this._model.find({
          photographerId,
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        });
      }
    
      async findByPhotographerAndDateRange(
        photographerId: Types.ObjectId,
        startDate: Date,
        endDate: Date
      ): Promise<IAvailability[]> {
        return await this._model.find({
          photographerId,
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        });
    }

    async delete(availabilityId: string): Promise<boolean> {
      const result = await this._model.findByIdAndDelete(availabilityId);
      return !!result;
    }
}
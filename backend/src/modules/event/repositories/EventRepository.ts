import { BaseRepository } from "../../../shared/repository/BaseRepository"
import type { IEvent } from "../../../shared/interfaces/iEvent";
import type { IEventRepository } from "../interfaces/IEventRepository";
import Event from "../../../shared/models/event.model";
import { Types } from "mongoose";

export class EventRepository extends BaseRepository<IEvent> implements IEventRepository{
    constructor(){super(Event)}

    async findByBookingId(
        bookingId: string
      ): Promise<IEvent | null> {
        return await this._model.findOne({
          bookingId: new Types.ObjectId(bookingId),
        });
      }
    
      async findByPublicId(
        publicId: string
      ): Promise<IEvent | null> {
        return await this._model.findOne({ publicId });
      }
    
      async findByPhotographerId(
        photographerId: string
      ): Promise<IEvent[]> {
        return await this._model
          .find({ photographerId })
          .sort({ createdAt: -1 });
      }
    
      async delete(id: string): Promise<boolean> {
        const result = await this._model.deleteOne({
          _id: id,
        });
    
        return result.deletedCount > 0;
      }
    
}
import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import Booking from "../../../shared/models/booking.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type { IBookingRepository } from "../interfaces/IBookingRepository";

export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
{
  constructor() {
    super(Booking);
  }
  async findByUserId(userId: string): Promise<IBooking[]> {
    return await this._model
      .find({ userId })
      .populate(
        "photographerId",
        "name profilePicture serviceAreas startingPrice"
      )
      .populate("packageId")
      .sort({ createdAt: -1 });
  }

  async findByPhotographerId(photographerId: string): Promise<IBooking[]> {
      return await this._model
      .find({photographerId})
      .populate("userId", "name email phone profilePicture")
      .populate("packageId")
      .sort({ createdAt: -1 });
  }

  async findConflict(photographerId: string, eventDate: Date): Promise<IBooking | null> {
    return await this._model.findOne({
      photographerId,
      eventDate,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });
  }
  async updateStatus(
    id: string,
    status: BookingStatus,
    rejectionReason?: string
  ): Promise<IBooking | null> {
    return await this._model.findByIdAndUpdate(
      id,
      { status, rejectionReason },
      { new: true }
    );
  }
}

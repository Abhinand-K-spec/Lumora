import type { BookingStatus, IBooking } from "../../../shared/interfaces/IBooking";
import Booking from "../../../shared/models/booking.model";
import { BaseRepository } from "../../../shared/repository/BaseRepository";
import type {
  BookingQueryOptions,
  IBookingRepository,
  PaginatedBookings,
} from "../interfaces/IBookingRepository";

export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
{
  constructor() {
    super(Booking);
  }

  async findByUserId(
    userId: string,
    options: BookingQueryOptions = {}
  ): Promise<PaginatedBookings> {
    const { status, page = 1, limit = 8 } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      this._model
        .find(filter)
        .populate("photographerId", "name email phone")
        .populate("packageId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this._model.countDocuments(filter),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPhotographerId(
    photographerId: string,
    options: BookingQueryOptions = {}
  ): Promise<PaginatedBookings> {
    const { status, page = 1, limit = 8 } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { photographerId };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      this._model
        .find(filter)
        .populate("userId", "name email phone")
        .populate("packageId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this._model.countDocuments(filter),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findConflict(photographerId: string, eventDates: Date[]): Promise<IBooking | null> {
    return await this._model.findOne({
      photographerId,
      "events.eventDate": { $in: eventDates },
      status: { $in: ["PENDING", "ACCEPTED"] },
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


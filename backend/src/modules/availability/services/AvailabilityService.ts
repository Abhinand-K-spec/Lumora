import { Types } from "mongoose";
import type { IBookingRepository } from "../../booking/interfaces/IBookingRepository";
import type { IAvailabilityRepository } from "../interfaces/IAvailabilityRepository";
import type { IAvailabilityService } from "../interfaces/IAvailabilityService";
import type { ICalendarDay, IMonthlyCalendar } from "../interfaces/ICalander";
import { AppError } from "../../../shared/errors/AppError";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code";
import { AVAILABILITY_MESSAGES } from "../../../shared/constants/message.constant";
import type { IBooking } from "../../../shared/interfaces/IBooking";
import type { IAvailability } from "../../../shared/interfaces/IAvailability";
import type { BlockAvailabilityDTO } from "../dtos/BlockAvailabilityDto";

export class AvailabilityService implements IAvailabilityService {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _availabilityRepository: IAvailabilityRepository
  ) {}

  private getMonthRange(
    month: number,
    year: number
  ): { startDate: Date; endDate: Date } {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    return { startDate, endDate };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private getDateKey(date: Date): string {
    return this.formatDate(date);
  }

  private getDaysInMonth(month: number, year: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  async getMonthlyCalendar(
    photographerId: Types.ObjectId,
    month: number,
    year: number
  ): Promise<IMonthlyCalendar> {
    if (month < 1 || month > 12) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.INVALID_MONTH
      );
    }

    if (year < 2020 || year > 2100) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.INVALID_YEAR
      );
    }

    const { startDate, endDate } = this.getMonthRange(month, year);

    const [bookings, blockedDates] = await Promise.all([
      this._bookingRepository.findCalendarBookings(
        photographerId?.toString(),
        startDate,
        endDate
      ),
      this._availabilityRepository.findByPhotographerAndDateRange(
        photographerId,
        startDate,
        endDate
      ),
    ]);

    const bookingMap = new Map<string, IBooking[]>();
    const pendingDateSet = new Set<string>();

    for (const booking of bookings) {
      for (const event of booking.events) {
        const eventDate = new Date(event.eventDate);
        const dateKey = this.getDateKey(eventDate);

        if (
          dateKey < this.formatDate(startDate) ||
          dateKey >= this.formatDate(endDate)
        ) {
          continue;
        }

        const existingBookings = bookingMap.get(dateKey) ?? [];
        existingBookings.push(booking);
        bookingMap.set(dateKey, existingBookings);

        if (booking.status === "PENDING") {
          pendingDateSet.add(dateKey);
        }
      }
    }

    const blockedDateMap = new Map<string, IAvailability>();

    for (const blocked of blockedDates) {
      const current = new Date(blocked.startDate);
      const end = new Date(blocked.endDate);

      while (current <= end) {
        const dateKey = this.getDateKey(current);

        if (
          dateKey >= this.formatDate(startDate) &&
          dateKey < this.formatDate(endDate)
        ) {
          blockedDateMap.set(dateKey, blocked);
        }

        current.setUTCDate(current.getUTCDate() + 1);
      }
    }

    const days: ICalendarDay[] = [];
    const daysInMonth = this.getDaysInMonth(month, year);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day));
      const dateKey = this.getDateKey(date);

      const dateBookings = bookingMap.get(dateKey) ?? [];

      const reservedBookings = dateBookings.filter(
        (booking) =>
          booking.status === "ACCEPTED" || booking.status === "COMPLETED"
      );

      const blocked = blockedDateMap.get(dateKey);

      let status: ICalendarDay["status"] = "AVAILABLE";

      if (reservedBookings.length > 0) {
        status = "BOOKED";
      } else if (blocked) {
        status = "BLOCKED";
      }

      days.push({
        date: dateKey,
        status,

        bookings: dateBookings.map((booking) => {
          const matchedEvent = booking.events?.find(
            (e) => this.formatDate(new Date(e.eventDate)) === dateKey
          );
          return {
            bookingId: booking._id!,
            eventDate: date,
            status: booking.status,
            eventType: matchedEvent?.eventType,
          };
        }),

        hasPendingRequests: pendingDateSet.has(dateKey),

        blockedReason: blocked?.reason ?? undefined,
        availabilityId: blocked?._id?.toString() ?? undefined,
      });
    }

    return {
      month,
      year,
      days,
    };
  }

  async blockDates(
    photographerId: Types.ObjectId,
    data: BlockAvailabilityDTO
  ): Promise<IAvailability> {
    const startDate = new Date(`${data.startDate}T00:00:00.000Z`);
    const endDate = new Date(`${data.endDate}T23:59:59.999Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.INVALID_DATE
      );
    }

    if (startDate > endDate) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.DATE_RANGE_INVALID
      );
    }

    // Check for existing overlapping blocks
    const existingBlocks =
      await this._availabilityRepository.findOverlapping(
        photographerId,
        startDate,
        endDate
      );

    if (existingBlocks.length > 0) {
      throw new AppError(
        HttpStatus.CONFLICT,
        AVAILABILITY_MESSAGES.OVERLAPPING_BLOCK
      );
    }

    // Check if there are already accepted/completed bookings on these dates
    const existingBookings =
      await this._bookingRepository.findCalendarBookings(
        photographerId.toString(),
        startDate,
        endDate
      );

    const hasConfirmedBookings = existingBookings.some(
      (b) => b.status === "ACCEPTED" || b.status === "COMPLETED"
    );

    if (hasConfirmedBookings) {
      throw new AppError(
        HttpStatus.CONFLICT,
        AVAILABILITY_MESSAGES.CONFLICT_WITH_BOOKING
      );
    }

    return await this._availabilityRepository.create({
      photographerId,
      startDate,
      endDate,
      type: "BLOCKED",
      ...(data.reason?.trim() ? { reason: data.reason.trim() } : {}),
    });
  }

  async unblockDates(
    photographerId: Types.ObjectId,
    availabilityId: string
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(availabilityId)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        AVAILABILITY_MESSAGES.NOT_FOUND
      );
    }

    const availability =
      await this._availabilityRepository.findById(availabilityId);

    if (!availability) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        AVAILABILITY_MESSAGES.NOT_FOUND
      );
    }

    if (
      availability.photographerId.toString() !== photographerId.toString()
    ) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        AVAILABILITY_MESSAGES.UNAUTHORIZED
      );
    }

    return await this._availabilityRepository.delete(availabilityId);
  }
}

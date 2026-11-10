import type { Types } from "mongoose";

export type CalendarDayStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "BLOCKED";

export interface ICalendarBooking {
  bookingId: Types.ObjectId;
  eventDate: Date;
  eventTime?: string | undefined;
  status: string;
  eventType?: string | undefined;
}

export interface ICalendarDay {
  date: string;
  status: CalendarDayStatus;
  bookings: ICalendarBooking[];
  hasPendingRequests: boolean;
  blockedReason: string | undefined;
  availabilityId?: string | undefined;
}

export interface IMonthlyCalendar {
  month: number;
  year: number;
  days: ICalendarDay[];
}
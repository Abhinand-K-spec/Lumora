// frontend/src/services/availabilityService.ts
import api from "../api/axios";
import type { ApiResponse } from "../types/api";

export type CalendarDayStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";

export interface CalendarBooking {
  bookingId: string;
  eventDate: string;
  status: string;
  eventType?: string;
}

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  status: CalendarDayStatus;
  bookings: CalendarBooking[];
  hasPendingRequests: boolean;
  blockedReason?: string;
  availabilityId?: string;
}

export interface MonthlyCalendar {
  month: number;
  year: number;
  days: CalendarDay[];
}

export interface BlockDatesPayload {
  startDate: string;
  endDate: string; 
  reason?: string;
}

const availabilityService = {
  async getMyCalendar(month: number, year: number): Promise<ApiResponse<MonthlyCalendar>> {
    const res = await api.get("/availability/my-calendar", {
      params: { month, year },
    });
    return res.data;
  },

  async getPhotographerCalendar(
    photographerId: string,
    month: number,
    year: number
  ): Promise<ApiResponse<MonthlyCalendar>> {
    const res = await api.get(`/availability/calendar/${photographerId}`, {
      params: { month, year },
    });
    return res.data;
  },

  async blockDates(payload: BlockDatesPayload): Promise<ApiResponse<unknown>> {
    const res = await api.post("/availability/block", payload);
    return res.data;
  },

  async unblockDates(availabilityId: string): Promise<ApiResponse<{ success: boolean }>> {
    const res = await api.delete(`/availability/unblock/${availabilityId}`);
    return res.data;
  },
};

export default availabilityService;
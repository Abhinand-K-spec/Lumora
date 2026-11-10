// frontend/src/components/photographer/availability/PhotographerCalendarView.tsx
import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import availabilityService, {
  type CalendarDay,
  type MonthlyCalendar,
} from "../../../services/availabilityService";
import BlockDatesModal from "./BlockDateModal";
import ConfirmationModal from "../../common/ConfirmationModal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PhotographerCalendarView() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendar, setCalendar] = useState<MonthlyCalendar | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedInitialDate, setSelectedInitialDate] = useState<string | undefined>();
  const [unblockTarget, setUnblockTarget] = useState<{ id: string; date: string } | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await availabilityService.getMyCalendar(currentMonth, currentYear);
      setCalendar(res.data);
    } catch {
      toast.error("Failed to load availability calendar.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleUnblockConfirm = async () => {
    if (!unblockTarget) return;
    try {
      setUnblocking(true);
      await availabilityService.unblockDates(unblockTarget.id);
      toast.success("Dates unblocked successfully.");
      setUnblockTarget(null);
      fetchCalendar();
    } catch {
      toast.error("Failed to unblock date.");
    } finally {
      setUnblocking(false);
    }
  };

  // Compute leading empty cells for day of week alignment
  const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay();
  const monthName = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toLocaleString("en-US", {
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-semibold font-heading text-white">
            {monthName} {currentYear}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your shoot schedule, active bookings, and blackout dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#070708] p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-text-secondary hover:text-white transition rounded-lg hover:bg-white/5 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth() + 1);
                setCurrentYear(today.getFullYear());
              }}
              className="px-3 py-1 text-xs text-text-secondary hover:text-white font-medium transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-text-secondary hover:text-white transition rounded-lg hover:bg-white/5 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedInitialDate(undefined);
              setIsBlockModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:brightness-110 transition shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus size={14} />
            <span>Block Dates</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-white/20 bg-white/5" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          Confirmed Booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          Blocked / Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F2C94C]" />
          Pending Request
        </span>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/5 bg-[#0f1012]">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0f1012] overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-[#070708] text-center text-[11px] font-semibold text-text-secondary/60 uppercase tracking-widest py-3">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
            {/* Empty offset padding for days before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-black/30 p-2" />
            ))}

            {/* Actual Month Days */}
            {calendar?.days.map((day: CalendarDay) => {
              const dayNum = parseInt(day.date.split("-")[2], 10);
              const isBlocked = day.status === "BLOCKED";
              const isBooked = day.status === "BOOKED";

              return (
                <div
                  key={day.date}
                  className={`min-h-[110px] p-2.5 flex flex-col justify-between transition group relative ${
                    isBlocked
                      ? "bg-red-500/[0.03] hover:bg-red-500/[0.06]"
                      : isBooked
                      ? "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]"
                      : "bg-[#0f1012] hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Top Bar inside day cell */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90">
                      {dayNum}
                    </span>

                    {/* Pending request pill */}
                    {day.hasPendingRequests && (
                      <span
                        className="flex h-2 w-2 rounded-full bg-[#F2C94C] animate-pulse"
                        title="Pending booking requests on this date"
                      />
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="my-1.5 space-y-1">
                    {isBooked && (
                      <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300 font-medium truncate flex items-center gap-1">
                        <CalendarCheck size={10} className="shrink-0" />
                        <span className="truncate">
                          {day.bookings[0]?.eventType || "Confirmed"}
                        </span>
                      </div>
                    )}

                    {isBlocked && (
                      <div className="rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-300 font-medium truncate flex items-center gap-1">
                        <Lock size={10} className="shrink-0" />
                        <span className="truncate">
                          {day.blockedReason || "Blocked"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cell Hover Quick Action */}
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center justify-end">
                    {isBlocked && day.availabilityId ? (
                      <button
                        onClick={() =>
                          setUnblockTarget({
                            id: day.availabilityId!,
                            date: day.date,
                          })
                        }
                        className="text-[10px] text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                      >
                        Unblock
                      </button>
                    ) : !isBooked ? (
                      <button
                        onClick={() => {
                          setSelectedInitialDate(day.date);
                          setIsBlockModalOpen(true);
                        }}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        + Block
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Dates Modal */}
      <BlockDatesModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSuccess={fetchCalendar}
        initialDate={selectedInitialDate}
      />

      {/* Unblock Confirmation Modal */}
      <ConfirmationModal
        isOpen={unblockTarget !== null}
        onClose={() => !unblocking && setUnblockTarget(null)}
        onConfirm={handleUnblockConfirm}
        title="Unblock Date?"
        description={`Are you sure you want to make ${unblockTarget?.date} available for new bookings again?`}
        confirmText="Yes, Unblock"
        cancelText="Cancel"
        variant="primary"
        loading={unblocking}
      />
    </div>
  );
}
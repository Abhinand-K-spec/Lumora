import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CalendarDays,
  MapPin,
  Search,
  LoaderCircle,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import eventService from "../../services/eventService";
import type { EventItem, EventStatus } from "../../types/event.types";
import { getErrorMessage } from "../../utils/errorUtils";

type StatusFilter = "ALL" | EventStatus;

const STATUS_STYLES: Record<
  EventStatus,
  { label: string; className: string; dot: string }
> = {
  UPCOMING: {
    label: "Upcoming",
    className: "border-[#F2C94C]/30 bg-[#F2C94C]/10 text-[#F2C94C]",
    dot: "bg-[#F2C94C]",
  },
  ONGOING: {
    label: "Ongoing",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    dot: "bg-sky-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
  },
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PhotographerEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getPhotographerEvents();
      setEvents(res.data.data.events ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load events."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      if (statusFilter !== "ALL" && ev.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const inName = ev.name.toLowerCase().includes(q);
      const inDesc = ev.description?.toLowerCase().includes(q) ?? false;
      const inPrograms = ev.programs.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.location?.toLowerCase().includes(q) ?? false)
      );
      return inName || inDesc || inPrograms;
    });
  }, [events, search, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      ALL: events.length,
      UPCOMING: 0,
      ONGOING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    events.forEach((ev) => {
      map[ev.status] = (map[ev.status] ?? 0) + 1;
    });
    return map;
  }, [events]);

  return (
    <div className="min-h-full bg-[#070708] text-text px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Event Management
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl text-white mt-1">
              Events
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Manage your active shoots, program schedules, and event statuses.
            </p>
          </div>

          <button
            onClick={() => navigate("/photographer/bookings")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101010] px-4 py-2.5 text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-white transition self-start sm:self-auto cursor-pointer"
          >
            <CalendarDays size={14} className="text-primary" />
            Create from Bookings
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#101010] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              ["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as StatusFilter[]
            ).map((status) => {
              const active = statusFilter === status;
              const label =
                status === "ALL" ? "All" : STATUS_STYLES[status].label;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-primary text-black font-semibold"
                      : "bg-[#070708] text-text-secondary border border-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active ? "bg-black/15 text-black" : "bg-white/[0.06]"
                    }`}
                  >
                    {counts[status]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/60"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event, program, venue..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#070708] pl-9 pr-3 py-2 text-xs text-white placeholder:text-text-secondary/50 focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 rounded-2xl border border-white/[0.07] bg-[#101010]">
            <LoaderCircle className="animate-spin text-primary" size={26} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#101010] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Camera size={22} />
            </div>
            <h3 className="text-sm font-semibold text-white">
              {events.length === 0 ? "No Events Yet" : "No Matching Events"}
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              {events.length === 0
                ? "Once a booking is accepted and the advance payment is completed, you can create an event directly from its booking details page."
                : "Try clearing your search or selecting a different status filter."}
            </p>
            {events.length === 0 && (
              <button
                onClick={() => navigate("/photographer/bookings")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-black hover:bg-primary/90 transition cursor-pointer"
              >
                Go to Bookings
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => {
              const badge = STATUS_STYLES[event.status];
              const firstProgram = event.programs[0];

              return (
                <div
                  key={event._id}
                  onClick={() => navigate(`/photographer/events/${event._id}`)}
                  className="group rounded-2xl border border-white/[0.07] bg-[#101010] p-5 hover:border-primary/30 transition cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-heading text-lg text-white truncate group-hover:text-primary transition">
                          {event.name}
                        </h2>
                        {event.description && (
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers size={13} className="text-primary/80" />
                        {event.programs.length}{" "}
                        {event.programs.length === 1 ? "Program" : "Programs"}
                      </span>

                      {firstProgram?.date && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-primary/80" />
                          {formatDate(firstProgram.date)}
                        </span>
                      )}

                      {firstProgram?.location && (
                        <span className="inline-flex items-center gap-1.5 truncate max-w-[220px]">
                          <MapPin size={13} className="text-primary/80 shrink-0" />
                          <span className="truncate">{firstProgram.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                    <span className="text-text-secondary/60 font-mono text-[11px]">
                      ID: {event.publicId.slice(0, 10)}...
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      Manage Event
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

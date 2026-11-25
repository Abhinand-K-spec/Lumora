import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Save,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import eventService from "../../services/eventService";
import type { EventItem, EventStatus } from "../../types/event.types";
import { getErrorMessage } from "../../utils/errorUtils";

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
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PhotographerEventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<EventStatus>("UPCOMING");

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await eventService.getEventById(eventId);
      const loaded = res.data.data.event;
      setEvent(loaded);
      setName(loaded.name);
      setDescription(loaded.description ?? "");
      setStatus(loaded.status);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load event details."));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || saving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Event name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await eventService.updateEvent(eventId, {
        name: trimmedName,
        description: description.trim(),
        status,
      });
      const updated = res.data.data.updatedEvent;
      setEvent(updated);
      setName(updated.name);
      setDescription(updated.description ?? "");
      setStatus(updated.status);
      toast.success("Event updated successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update event."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#070708]">
        <LoaderCircle className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#070708] p-6 text-center">
        <AlertCircle className="text-red-400" size={32} />
        <h2 className="font-heading text-xl text-white">Event Not Found</h2>
        <button
          onClick={() => navigate("/photographer/events")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-text-secondary hover:text-white cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Events
        </button>
      </div>
    );
  }

  const badge = STATUS_STYLES[event.status];

  return (
    <div className="min-h-full bg-[#070708] text-text px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/photographer/events")}
            className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-white transition self-start cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Events
          </button>

          <button
            onClick={() => navigate(`/photographer/booking/${event.bookingId}`)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#101010] px-3.5 py-2 text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-white transition self-start sm:self-auto cursor-pointer"
          >
            <ExternalLink size={13} className="text-primary" />
            View Related Booking
          </button>
        </div>

        {/* Header Card */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#101010] p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Event Overview
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl text-white mt-1">
                {event.name}
              </h1>
              {event.description && (
                <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Programs Schedule */}
          <section className="lg:col-span-7 rounded-2xl border border-white/[0.07] bg-[#101010] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Schedule
                </span>
                <h2 className="font-heading text-lg text-white mt-0.5">
                  Event Programs ({event.programs.length})
                </h2>
              </div>
              <Layers size={18} className="text-primary/70" />
            </div>

            <div className="space-y-3">
              {event.programs.map((program, idx) => (
                <div
                  key={`${program.name}-${idx}`}
                  className="rounded-xl border border-white/[0.06] bg-[#070708] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {program.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                      <CalendarDays size={13} />
                      {formatDate(program.date)}
                    </span>
                  </div>

                  {program.location && (
                    <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-text-secondary/70 shrink-0" />
                        {program.location}
                      </span>

                      {program.coordinates && program.coordinates.length === 2 && (
                        <a
                          href={`https://www.google.com/maps?q=${program.coordinates[1]},${program.coordinates[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0"
                        >
                          Map <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Edit Event Form */}
          <section className="lg:col-span-5 rounded-2xl border border-white/[0.07] bg-[#101010] p-6 space-y-5 self-start">
            <div className="border-b border-white/[0.08] pb-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Settings
              </span>
              <h2 className="font-heading text-lg text-white mt-0.5">
                Update Event
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Event Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070708] px-3.5 py-2.5 text-xs text-white focus:border-primary/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Add notes or overview for this event..."
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070708] px-3.5 py-2.5 text-xs text-white placeholder:text-text-secondary/40 focus:border-primary/40 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070708] px-3.5 py-2.5 text-xs text-white focus:border-primary/40 focus:outline-none"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-black hover:bg-primary/90 disabled:opacity-60 transition cursor-pointer"
              >
                {saving ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="rounded-xl border border-white/[0.06] bg-[#070708] p-3.5 flex items-center gap-2.5 text-[11px] text-text-secondary">
              <CheckCircle2 size={14} className="text-primary shrink-0" />
              <span>
                Created on {formatDate(event.createdAt)}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

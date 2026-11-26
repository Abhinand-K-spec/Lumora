import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ScanFace,
  LayoutGrid,
  UserRound,
  X,
  CalendarDays,
  MapPin,
  LoaderCircle,
  AlertCircle,
  ExternalLink,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import eventService from "../../services/eventService";
import type { EventItem, EventStatus } from "../../types/event.types";
import { getErrorMessage } from "../../utils/errorUtils";

const STATUS_DISPLAY: Record<
  EventStatus,
  { banner: string; stat: string; dotClass: string }
> = {
  UPCOMING: {
    banner: "UPCOMING: PREPARING GALLERY",
    stat: "Soon",
    dotClass: "bg-[#F2C94C]",
  },
  ONGOING: {
    banner: "LIVE: PHOTO INGESTING",
    stat: "Live",
    dotClass: "bg-emerald-400 animate-pulse",
  },
  COMPLETED: {
    banner: "GALLERY READY",
    stat: "Ready",
    dotClass: "bg-emerald-400",
  },
  CANCELLED: {
    banner: "EVENT CANCELLED",
    stat: "Closed",
    dotClass: "bg-red-400",
  },
};

const formatBadgeDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
};

const formatProgramDate = (dateStr?: string) => {
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

export default function PublicEventPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "highlights">(
    "overview"
  );

  const fetchPublicEvent = useCallback(async () => {
    if (!publicId) {
      setErrorMessage("Invalid event link.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const res = await eventService.getPublicEvent(publicId);
      setEvent(res.data.data.event);
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "This event is unavailable or could not be found.")
      );
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    void fetchPublicEvent();
  }, [fetchPublicEvent]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070708]">
        <LoaderCircle className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!event || errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070708] px-6 text-center text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#101010] p-8 space-y-4">
          <AlertCircle className="mx-auto text-primary" size={32} />
          <h1 className="font-heading text-2xl text-white">
            Event Unavailable
          </h1>
          <p className="text-xs leading-relaxed text-text-secondary">
            {errorMessage || "We could not locate this event."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-black hover:bg-primary/90 transition cursor-pointer"
          >
            Back to Lumora
          </button>
        </div>
      </div>
    );
  }

  const firstProgram = event.programs[0];
  const badgeLabel = firstProgram?.name?.toUpperCase() || "EVENT";
  const badgeDate = formatBadgeDate(firstProgram?.date);
  const statusInfo = STATUS_DISPLAY[event.status];

  const photographerObj =
    typeof event.photographerId === "object" && event.photographerId !== null
      ? event.photographerId
      : null;
  const photographerName = photographerObj?.name || "Lumora Photographer";
  const photographerEmail = photographerObj?.email;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-text flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <header className="border-b border-white/[0.06] bg-[#0B0B0D]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
            <div className="inline-flex items-center gap-2 text-primary">
              <Sparkles size={15} />
              <span className="font-heading text-sm font-semibold tracking-[0.22em]">
                LUMORA
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-6 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusInfo.dotClass}`} />
                <span className="uppercase tracking-[0.16em] text-[10px] font-semibold">
                  {statusInfo.banner}
                </span>
              </span>
              {photographerEmail && (
                <a
                  href={`mailto:${photographerEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary transition"
                >
                  <Mail size={13} />
                  Contact Photographer
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Close"
              className="text-primary/80 hover:text-primary transition p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-6xl lg:px-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10 lg:items-start">
            {/* Left Column: Hero, Welcome, Stats & Desktop Schedule */}
            <div className="lg:col-span-7">
              {/* Hero Identity (without cover image) */}
              <section className="px-5 pt-7 pb-6 lg:px-0 lg:pt-0 lg:pb-8 border-b border-white/[0.06] bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent lg:bg-none">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  <span className="rounded bg-primary/20 border border-primary/30 px-2 py-0.5 text-primary">
                    {badgeLabel}
                  </span>
                  {badgeDate && (
                    <>
                      <span className="text-text-secondary/50">•</span>
                      <span className="text-text-secondary">{badgeDate}</span>
                    </>
                  )}
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-[1.12] text-white mt-3 lg:mt-4">
                  {event.name}
                </h1>

                <p className="mt-2.5 text-xs sm:text-sm italic text-text-secondary">
                  Photography by {photographerName}
                </p>
              </section>

              {/* Live Status (Mobile) & Welcome */}
              <section className="px-5 pt-6 lg:px-0 lg:pt-7 space-y-5">
                <div className="inline-flex items-center gap-2 lg:hidden">
                  <span
                    className={`h-2 w-2 rounded-full ${statusInfo.dotClass}`}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    {statusInfo.banner}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h2 className="font-heading text-xl lg:text-2xl text-primary">
                    Welcome to the Celebration
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-text-secondary max-w-2xl">
                    {event.description ||
                      `We're delighted to have you here. Capture and relive every precious moment from ${event.name} through our AI-powered gallery experience.`}
                  </p>
                </div>

                {/* Desktop Stats Row (inline on left column) */}
                <div className="hidden lg:grid grid-cols-3 divide-x divide-white/[0.08] rounded-2xl border border-white/[0.07] bg-[#111113] py-5 text-center">
                  <div>
                    <p className="font-heading text-2xl text-white">
                      {event.programs.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                      Programs
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl text-white">
                      {statusInfo.stat}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                      Status
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl text-white">4K</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                      Quality
                    </p>
                  </div>
                </div>

                {/* Desktop Event Programs Schedule (always visible on lg+) */}
                <div className="hidden lg:block rounded-2xl border border-white/[0.07] bg-[#111113] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Event Schedule & Programs
                    </span>
                    <span className="text-xs text-text-secondary">
                      {event.programs.length}{" "}
                      {event.programs.length === 1 ? "Session" : "Sessions"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.programs.map((program, idx) => (
                      <div
                        key={`${program.name}-${idx}`}
                        className="rounded-xl border border-white/[0.06] bg-[#0B0B0D] p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white">
                            {program.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-primary shrink-0">
                            <CalendarDays size={12} />
                            {formatProgramDate(program.date)}
                          </span>
                        </div>

                        {program.location && (
                          <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">
                                {program.location}
                              </span>
                            </span>
                            {program.coordinates &&
                              program.coordinates.length === 2 && (
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
                </div>
              </section>
            </div>

            {/* Right Column: Primary Action Cards + Mobile Schedule & Stats */}
            <div className="lg:col-span-5 px-5 pt-5 lg:px-0 lg:pt-0 space-y-4">
              {/* Primary Gold Card: Find My Photos */}
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "AI face matching will be available as soon as photos are uploaded."
                  )
                }
                className="w-full text-left rounded-2xl bg-[#F3C86A] p-5 lg:p-6 text-[#14110B] shadow-lg shadow-primary/10 hover:brightness-105 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <ScanFace size={22} className="text-[#14110B]" />
                  <ArrowRight size={17} className="text-[#14110B]/80" />
                </div>
                <h3 className="font-heading text-lg lg:text-xl font-semibold mt-4">
                  Find My Photos
                </h3>
                <p className="text-[11px] sm:text-xs leading-relaxed text-[#14110B]/80 mt-1">
                  Use AI face matching to find every photo you&apos;re in
                  instantly.
                </p>
              </button>

              {/* Dark Card: Event Highlights */}
              <button
                type="button"
                onClick={() =>
                  setActiveTab((prev) =>
                    prev === "highlights" ? "overview" : "highlights"
                  )
                }
                className="w-full text-left rounded-2xl border border-white/[0.08] bg-[#161618] p-5 lg:p-6 hover:border-primary/35 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Sparkles size={18} className="text-primary" />
                  <ArrowRight size={15} className="text-text-secondary/60" />
                </div>
                <h3 className="font-heading text-lg lg:text-xl text-primary mt-4">
                  Event Highlights
                </h3>
                <p className="text-[11px] sm:text-xs leading-relaxed text-text-secondary mt-1">
                  Access the curated master gallery and view session highlights.
                </p>
              </button>

              {/* Mobile Expandable Event Schedule / Highlights */}
              {activeTab === "highlights" && (
                <div className="lg:hidden rounded-2xl border border-white/[0.08] bg-[#111113] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Event Programs
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {event.programs.length}{" "}
                      {event.programs.length === 1 ? "Session" : "Sessions"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {event.programs.map((program, idx) => (
                      <div
                        key={`${program.name}-${idx}`}
                        className="rounded-xl border border-white/[0.06] bg-[#0B0B0D] p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {program.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                            <CalendarDays size={11} />
                            {formatProgramDate(program.date)}
                          </span>
                        </div>

                        {program.location && (
                          <p className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                            <MapPin size={11} className="shrink-0" />
                            <span>{program.location}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile 3-Column Stats Row */}
              <div className="lg:hidden grid grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.06] py-5 text-center">
                <div>
                  <p className="font-heading text-lg text-white">
                    {event.programs.length}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                    Programs
                  </p>
                </div>
                <div>
                  <p className="font-heading text-lg text-white">
                    {statusInfo.stat}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                    Status
                  </p>
                </div>
                <div>
                  <p className="font-heading text-lg text-white">4K</p>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-secondary/70 mt-1">
                    Quality
                  </p>
                </div>
              </div>

              {/* Desktop Photographer Card */}
              <div className="hidden lg:flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                    <UserRound size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                      Photographer
                    </p>
                    <p className="text-sm font-medium text-white">
                      {photographerName}
                    </p>
                  </div>
                </div>

                {photographerEmail && (
                  <a
                    href={`mailto:${photographerEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0B0B0D] px-3.5 py-2 text-xs text-text-secondary hover:border-primary/30 hover:text-white transition"
                  >
                    <Mail size={13} className="text-primary" />
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer + Mobile Bottom Nav */}
      <div className="pt-8">
        <footer className="mx-auto max-w-6xl border-t border-white/[0.06] px-5 py-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Lumora Events
          </p>

          <div className="flex items-center justify-center gap-3 text-[11px] text-text-secondary/70">
            <span>Privacy Policy</span>
            <span>|</span>
            {photographerEmail ? (
              <a
                href={`mailto:${photographerEmail}`}
                className="hover:text-primary transition"
              >
                Contact Photographer
              </a>
            ) : (
              <button
                type="button"
                onClick={() => toast.info(`Photographer: ${photographerName}`)}
                className="hover:text-primary transition cursor-pointer"
              >
                Contact Photographer
              </button>
            )}
          </div>

          <p className="text-[9px] uppercase tracking-[0.14em] text-text-secondary/40">
            © {new Date().getFullYear()} Lumora Events. All Rights Reserved.
          </p>
        </footer>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden grid grid-cols-3 border-t border-white/[0.06] bg-[#070708] py-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className="flex items-center justify-center cursor-pointer"
            aria-label="Event Overview"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                activeTab === "overview"
                  ? "bg-[#F3C86A] text-[#14110B]"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <LayoutGrid size={15} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("highlights")}
            className="flex items-center justify-center cursor-pointer"
            aria-label="Event Highlights"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                activeTab === "highlights"
                  ? "bg-[#F3C86A] text-[#14110B]"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <Sparkles size={15} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => toast.info(`Photography by ${photographerName}`)}
            className="flex items-center justify-center text-text-secondary hover:text-white transition cursor-pointer"
            aria-label="Photographer Info"
          >
            <UserRound size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}

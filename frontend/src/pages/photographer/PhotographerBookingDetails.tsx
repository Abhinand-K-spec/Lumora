
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  UserRound,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Phone,
  Package,
  ClipboardList,
  CalendarCheck,
  LoaderCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import bookingService, {
  type BookingItem,
  type BookingStatus,
} from "../../services/bookingService";
import { getErrorMessage } from "../../utils/errorUtils";

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Pending Review",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    label: "Declined",
    className: "border-red-500/25 bg-red-500/10 text-red-300",
    dot: "bg-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-neutral-500/25 bg-neutral-500/10 text-neutral-300",
    dot: "bg-neutral-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
  },
};

const formatDate = (value?: string) => {
  if (!value) return "Date not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name?: string) => {
  if (!name?.trim()) return "CL";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const formatEventName = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const SectionHeading = ({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-6 flex items-start gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-heading text-sm text-primary">
      {number}
    </span>
    <div>
      <h2 className="font-heading text-xl font-medium tracking-tight text-white sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
        {subtitle}
      </p>
    </div>
  </div>
);

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}) => (
  <div className="flex min-w-0 items-start gap-3">
    <div className="mt-0.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-primary/80">
      <Icon size={15} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/60">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-relaxed text-white/90">
        {value}
      </p>
    </div>
  </div>
);

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setPageError("A booking ID was not provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const response = await bookingService.getBookingById(bookingId);
      const result = response.data.data;

      if (!result) {
        throw new Error("The booking was not found in the response.");
      }

      setBooking(result);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load booking details."
      );

      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  const handleStatusUpdate = async (
    status: Extract<BookingStatus, "ACCEPTED" | "REJECTED">
  ) => {
    if (!booking || !bookingId || actionLoading) return;

    const actionLabel = status === "ACCEPTED" ? "accept" : "decline";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this booking?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await bookingService.updateBookingStatus(bookingId, status);

      setBooking((current) =>
        current ? { ...current, status } : current
      );

      toast.success(
        status === "ACCEPTED"
          ? "Booking accepted successfully."
          : "Booking declined successfully."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update booking status.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="animate-spin text-primary" size={30} />
          <p className="text-sm text-text-secondary">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (pageError || !booking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#080808] px-5">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#101010] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={34} />
          <h1 className="font-heading text-2xl text-white">
            Booking unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {pageError || "We couldn't find this booking."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/5"
            >
              Go back
            </button>
            <button
              onClick={() => void fetchBooking()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[booking.status];
  const client = booking.userId;
  const events = [...booking.events].sort(
    (a, b) =>
      new Date(a.eventDate).getTime() -
      new Date(b.eventDate).getTime()
  );

  const firstEvent = events[0];
  const packagePrice = booking.packageId?.price;
  const eventTypes = [
    ...new Set(events.map((event) => formatEventName(event.eventType))),
  ];

  return (
    <div className="min-h-full bg-[#080808] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        {/* Breadcrumbs */}
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <button
            onClick={() => navigate("/photographer/bookings")}
            className="transition hover:text-primary"
          >
            Bookings
          </button>
          <ChevronRight size={13} className="opacity-50" />
          <span className="text-white/80">Booking Details</span>
          <ChevronRight size={13} className="opacity-50" />
          <span className="max-w-36 truncate text-primary">
            #{booking._id.slice(-8).toUpperCase()}
          </span>
        </nav>

        {/* Booking heading */}
        <div className="mb-9 flex flex-col gap-6 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                Booking dossier
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            <h1 className="break-words font-heading text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              {client?.name || "Client Booking"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Review the event brief, client requirements, and schedule for
              this photography engagement.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary/70">
              <span className="inline-flex items-center gap-2">
                <FileText size={14} className="text-primary/70" />
                Ref. {booking._id.slice(-8).toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} className="text-primary/70" />
                Submitted {formatShortDate(booking.createdAt)}
              </span>
            </div>
          </div>

          {booking.status === "PENDING" && (
            <div className="flex flex-wrap gap-3 xl:shrink-0">
              <button
                disabled={actionLoading}
                onClick={() => void handleStatusUpdate("REJECTED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.05] px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={16} />
                Decline
              </button>
              <button
                disabled={actionLoading}
                onClick={() => void handleStatusUpdate("ACCEPTED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(197,160,89,0.08)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {actionLoading ? "Processing..." : "Accept Booking"}
              </button>
            </div>
          )}
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* Main column */}
          <div className="min-w-0 space-y-8">

            {/* Project overview */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#101010] p-5 sm:p-7 lg:p-8">
              <SectionHeading
                number="01"
                title="Project Overview"
                subtitle="The essential details of this photography engagement."
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <DetailItem
                  label="Primary event"
                  value={
                    firstEvent
                      ? formatEventName(firstEvent.eventType)
                      : "Not specified"
                  }
                  icon={Camera}
                />
                <DetailItem
                  label="Event date"
                  value={
                    firstEvent
                      ? formatDate(firstEvent.eventDate)
                      : "Not specified"
                  }
                  icon={CalendarDays}
                />
                <DetailItem
                  label="Event location"
                  value={firstEvent?.location || "Location not specified"}
                  icon={MapPin}
                />
                <DetailItem
                  label="Selected package"
                  value={booking.packageId?.packageName || "Custom quotation"}
                  icon={Package}
                />
              </div>

              {booking.notes && (
                <div className="mt-7 border-t border-white/[0.07] pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardList size={15} className="text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      Client's brief
                    </h3>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-white/75">
                    {booking.notes}
                  </p>
                </div>
              )}
            </section>

            {/* Service requirements */}
            <section>
              <SectionHeading
                number="02"
                title="Service Requirements"
                subtitle="The event categories requested by your client."
              />

              {events.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {events.map((event, index) => (
                    <article
                      key={`${event.eventType}-${event.eventDate}-${index}`}
                      className="group rounded-2xl border border-white/[0.07] bg-[#101010] p-5 transition duration-300 hover:border-primary/25 hover:bg-[#121212]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.07] text-primary">
                          <Camera size={19} />
                        </div>
                        <span className="rounded-md border border-white/[0.07] px-2 py-1 text-[10px] uppercase tracking-wider text-text-secondary">
                          Event {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg text-white">
                        {formatEventName(event.eventType)}
                      </h3>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2.5 text-xs text-text-secondary">
                          <CalendarDays
                            size={14}
                            className="mt-0.5 shrink-0 text-primary/70"
                          />
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs text-text-secondary">
                          <MapPin
                            size={14}
                            className="mt-0.5 shrink-0 text-primary/70"
                          />
                          <span className="break-words">
                            {event.location || "Location to be confirmed"}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-[#101010] p-6 text-sm text-text-secondary">
                  No event details have been added to this booking.
                </div>
              )}

              {eventTypes.length > 0 && (
                <p className="mt-4 text-xs text-text-secondary/60">
                  {events.length} scheduled event
                  {events.length === 1 ? "" : "s"} across{" "}
                  {eventTypes.length} event categor
                  {eventTypes.length === 1 ? "y" : "ies"}.
                </p>
              )}
            </section>

            {/* Event schedule */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#101010] p-5 sm:p-7 lg:p-8">
              <SectionHeading
                number="03"
                title="Celebration Schedule"
                subtitle="A chronological overview of the requested events."
              />

              {events.length > 0 ? (
                <div className="relative ml-2 space-y-0">
                  {events.map((event, index) => (
                    <div
                      key={`${event.eventType}-${event.eventDate}-timeline-${index}`}
                      className="relative flex gap-4 pb-7 last:pb-0 sm:gap-6"
                    >
                      {index < events.length - 1 && (
                        <div className="absolute bottom-0 left-[15px] top-8 w-px bg-gradient-to-b from-primary/40 to-white/[0.04]" />
                      )}

                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-[#18150f] text-primary">
                        <span className="text-[10px] font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-heading text-base text-white sm:text-lg">
                              {formatEventName(event.eventType)}
                            </h3>
                            <p className="mt-1.5 flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                              <MapPin
                                size={13}
                                className="mt-0.5 shrink-0 text-primary/70"
                              />
                              {event.location || "Location not specified"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-white/80 sm:shrink-0">
                            <CalendarDays size={14} className="text-primary" />
                            {formatShortDate(event.eventDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  The schedule has not been specified yet.
                </p>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">

            {/* Booking summary */}
            <section className="overflow-hidden rounded-2xl border border-primary/20 bg-[#10100e]">
              <div className="border-b border-primary/15 bg-gradient-to-br from-primary/[0.10] to-transparent p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Engagement summary
                  </span>
                  <Sparkles size={16} className="text-primary/70" />
                </div>

                <h2 className="font-heading text-2xl text-white">
                  {booking.packageId?.packageName || "Custom Package"}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {booking.packageId?.description ||
                    "Photography package details and pricing."}
                </p>

                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
                    {packagePrice != null ? "Package price" : "Pricing"}
                  </p>
                  <p className="mt-2 font-heading text-3xl text-primary">
                    {packagePrice != null
                      ? `₹${packagePrice.toLocaleString("en-IN")}`
                      : "On request"}
                  </p>
                  <p className="mt-2 text-[11px] text-text-secondary/70">
                    {packagePrice != null
                      ? "Listed package price; final terms may vary."
                      : "A custom quotation may be required."}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <DetailItem
                  label="Booking reference"
                  value={`#${booking._id.slice(-8).toUpperCase()}`}
                  icon={FileText}
                />
                <DetailItem
                  label="Request submitted"
                  value={formatDate(booking.createdAt)}
                  icon={CalendarCheck}
                />
                <DetailItem
                  label="Total events"
                  value={`${events.length} event${events.length === 1 ? "" : "s"}`}
                  icon={CalendarDays}
                />
                <DetailItem
                  label="Booking status"
                  value={status.label}
                  icon={ShieldCheck}
                />
              </div>
            </section>

            {/* Client information */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#101010] p-6">
              <div className="mb-5 flex items-center gap-2">
                <UserRound size={16} className="text-primary" />
                <h2 className="font-heading text-lg text-white">
                  Client Information
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-heading text-lg text-primary">
                  {getInitials(client?.name)}
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-white">
                    {client?.name || "Client"}
                  </p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Booking customer
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-white/[0.07] pt-5">
                {client?.email && (
                  <div className="flex items-start gap-3 text-xs">
                    <Mail
                      size={14}
                      className="mt-0.5 shrink-0 text-primary/70"
                    />
                    <a
                      href={`mailto:${client.email}`}
                      className="break-all leading-relaxed text-text-secondary transition hover:text-primary"
                    >
                      {client.email}
                    </a>
                  </div>
                )}

                {client?.phone && (
                  <div className="flex items-start gap-3 text-xs">
                    <Phone
                      size={14}
                      className="mt-0.5 shrink-0 text-primary/70"
                    />
                    <a
                      href={`tel:${client.phone}`}
                      className="break-all text-text-secondary transition hover:text-primary"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}

                {!client?.email && !client?.phone && (
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Contact information is not available in this booking
                    response.
                  </p>
                )}
              </div>
            </section>

            {/* Workflow note */}
            <section className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-primary/15 bg-primary/[0.06] p-2 text-primary">
                  <Clock size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Next steps
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-text-secondary">
                    {booking.status === "PENDING"
                      ? "Review the event dates, locations, and client brief before accepting or declining the request."
                      : booking.status === "ACCEPTED"
                        ? "This booking has been accepted. Coordinate the event requirements and confirm any remaining arrangements with the client."
                        : booking.status === "COMPLETED"
                          ? "This booking is marked as completed."
                          : `This booking is ${booking.status.toLowerCase()}. Review the details and contact the client if further clarification is needed.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Back action */}
            <button
              onClick={() => navigate("/photographer/bookings")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-3 text-sm text-text-secondary transition hover:border-primary/25 hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to all bookings
            </button>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-[10px] text-text-secondary/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Lumora. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>Private booking details</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} />
              Secure workspace
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingDetails;

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import bookingService, {
  type BookingItem,
  type BookingStatus,
} from "../../services/bookingService";
import { getErrorMessage } from "../../utils/errorUtils";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const PAGE_LIMIT = 6;

const STATUS_TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const Bookings = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<string | null>(null);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");

  const fetchBookings = useCallback(async (pg: number, status: BookingStatus | "ALL") => {
    try {
      setLoading(true);
      const res = await bookingService.getUserBookings({
        page: pg,
        limit: PAGE_LIMIT,
        ...(status !== "ALL" ? { status } : {}),
      });
      const data = res.data.data;
      setBookings(data.bookings ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to load bookings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(page, statusFilter);
  }, [page, statusFilter, fetchBookings]);

  const handleStatusChange = (status: BookingStatus | "ALL") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingToCancel) return;
    try {
      setCancellingId(selectedBookingToCancel);
      await bookingService.updateBookingStatus(selectedBookingToCancel, "CANCELLED");
      toast.success("Booking cancelled successfully.");
      await fetchBookings(page, statusFilter);
      setSelectedBookingToCancel(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to cancel booking."));
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: BookingItem["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#F2C94C] bg-[#F2C94C]/10 border border-[#F2C94C]/20 px-2.5 py-1 rounded-full">
            <Clock size={12} /> Pending Response
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
            <XCircle size={12} /> Declined
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-white">My Bookings</h1>
        <p className="text-xs text-text-secondary mt-1">
          Track upcoming shoot dates and status of your photographer requests.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
              statusFilter === tab.value
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-text-secondary border-white/10 hover:border-white/25 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {total > 0 && (
          <span className="ml-auto text-[11px] text-text-secondary/60">
            {total} booking{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 border border-white/10 border-dashed rounded-2xl bg-[#070708] space-y-4">
          <Camera className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {statusFilter === "ALL" ? "No Bookings Placed Yet" : `No ${statusFilter.toLowerCase()} bookings`}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Browse through verified photographers in Lumora and book dates for your special events.
          </p>
          {statusFilter === "ALL" && (
            <Link
              to="/photographers"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              <span>Explore Photographers</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#0f1012] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-white/20 transition"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {booking.photographerId?.name || "Photographer"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{booking.photographerId?.email}</span>
                    {booking.packageId && (
                      <span className="text-primary font-medium">
                        • {booking.packageId.packageName} Collection
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(booking.status)}
                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => setSelectedBookingToCancel(booking._id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer transition"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>

              {/* Events */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Scheduled Events ({booking.events?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.events?.map((ev, idx) => (
                    <div key={idx} className="bg-[#070708] border border-white/5 rounded-xl p-3 space-y-1">
                      <div className="text-xs font-semibold text-white">{ev.eventType}</div>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Calendar size={12} />
                        <span>
                          {new Date(ev.eventDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {ev.location && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin size={11} className="text-gray-500" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="text-xs text-gray-400 bg-[#070708] p-3 rounded-lg border border-white/5">
                  <span className="text-gray-500 font-semibold">Your Notes: </span>
                  {booking.notes}
                </div>
              )}
            </div>
          ))}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <p className="text-xs text-text-secondary/50">
                Page <span className="text-text-secondary">{page}</span> of{" "}
                <span className="text-text-secondary">{totalPages}</span>{" "}
                ({total} total)
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary border border-white/10 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      page === n
                        ? "bg-primary text-black border-primary"
                        : "border-white/10 text-text-secondary hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary border border-white/10 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={selectedBookingToCancel !== null}
        onClose={() => !cancellingId && setSelectedBookingToCancel(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking Request"
        description="Are you sure you want to cancel this booking request? This action cannot be reversed."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        loading={cancellingId !== null}
      />
    </div>
  );
};

export default Bookings;

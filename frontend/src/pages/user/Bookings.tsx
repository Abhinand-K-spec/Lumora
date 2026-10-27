import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import bookingService, {
  type BookingItem,
} from "../../services/bookingService";
import { getErrorMessage } from "../../utils/errorUtils";

import ConfirmationModal from "../../components/common/ConfirmationModal";

const Bookings = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getUserBookings();
      setBookings(res.data.data.bookings || []);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to load bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBookingToCancel) return;

    try {
      setCancellingId(selectedBookingToCancel);
      await bookingService.updateBookingStatus(selectedBookingToCancel, "CANCELLED");
      toast.success("Booking cancelled successfully.");
      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBookingToCancel ? { ...b, status: "CANCELLED" } : b))
      );
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-white">
          My Bookings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Track upcoming shoot dates and status of your photographer requests.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 border border-white/10 border-dashed rounded-2xl bg-[#070708] space-y-4">
          <Camera className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            No Bookings Placed Yet
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Browse through verified photographers in Lumora and book dates for your
            special events.
          </p>
          <Link
            to="/photographers"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            <span>Explore Photographers</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#0f1012] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-white/20 transition"
            >
              {/* Top Row: Photographer Info & Status */}
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

              {/* Middle: Events & Dates list */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Scheduled Events ({booking.events?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.events?.map((ev, idx) => (
                    <div
                      key={idx}
                      className="bg-[#070708] border border-white/5 rounded-xl p-3 space-y-1"
                    >
                      <div className="text-xs font-semibold text-white">
                        {ev.eventType}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Calendar size={12} />
                        <span>{new Date(ev.eventDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}</span>
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

              {/* Bottom: Notes */}
              {booking.notes && (
                <div className="text-xs text-gray-400 bg-[#070708] p-3 rounded-lg border border-white/5">
                  <span className="text-gray-500 font-semibold">Your Notes: </span>
                  {booking.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      <ConfirmationModal
        isOpen={selectedBookingToCancel !== null}
        onClose={() => setSelectedBookingToCancel(null)}
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

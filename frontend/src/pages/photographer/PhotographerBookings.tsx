
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  MoreVertical,
  Check,
  X,
  CalendarDays,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import bookingService, {
  type BookingItem,
  type BookingStatus,
} from "../../services/bookingService";
import { Table, type Column } from "../../components/common/Table";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errorUtils";

const getInitials = (name?: string) => {
  if (!name) return "??";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const AVATAR_PALETTE = [
  "bg-amber-700/30 text-amber-300 border-amber-700/40",
  "bg-emerald-800/30 text-emerald-300 border-emerald-700/40",
  "bg-indigo-800/30 text-indigo-300 border-indigo-700/40",
  "bg-rose-800/30 text-rose-300 border-rose-700/40",
  "bg-violet-800/30 text-violet-300 border-violet-700/40",
  "bg-cyan-800/30 text-cyan-300 border-cyan-700/40",
];

const avatarColor = (name?: string) => {
  if (!name) return AVATAR_PALETTE[0];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + hash * 31;
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const STATUS_CONFIG: Record<
  string,
  { pill: string; dot: string; label: string }
> = {
  PENDING: {
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
    dot: "bg-amber-400",
    label: "Pending",
  },
  ACCEPTED: {
    pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    dot: "bg-emerald-400",
    label: "Accepted",
  },
  REJECTED: {
    pill: "bg-red-500/10 text-red-400 border border-red-500/25",
    dot: "bg-red-400",
    label: "Rejected",
  },
  CANCELLED: {
    pill: "bg-neutral-500/10 text-neutral-400 border border-neutral-500/25",
    dot: "bg-neutral-400",
    label: "Cancelled",
  },
  COMPLETED: {
    pill: "bg-sky-500/10 text-sky-400 border border-sky-500/25",
    dot: "bg-sky-400",
    label: "Completed",
  },
};

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

interface ActionState {
  bookingId: string;
  action: "ACCEPTED" | "REJECTED";
}

const PAGE_SIZE = 8;

const PhotographerBookings = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Action menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Confirmation modal
  const [confirmState, setConfirmState] =
    useState<ActionState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ── Fetch bookings from the backend ── */
  const fetchBookings = useCallback(
    async (pg: number, status: StatusFilter) => {
      try {
        setLoading(true);

        const res = await bookingService.getPhotographerBookings({
          page: pg,
          limit: PAGE_SIZE,
          ...(status !== "ALL"
            ? { status: status as BookingStatus }
            : {}),
        });

        const data = res.data.data;

        setBookings(data.bookings ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        toast.error(
          getErrorMessage(err, "Failed to load booking requests.")
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBookings(page, statusFilter);
  }, [page, statusFilter, fetchBookings]);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = () => {
      setStatusOpen(false);
      setCategoryOpen(false);
      setOpenMenuId(null);
    };

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);

  /* ── Categories from the currently fetched page ── */
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    bookings.forEach((booking) => {
      booking.events.forEach((event) => {
        categorySet.add(event.eventType);
      });
    });

    return Array.from(categorySet).sort();
  }, [bookings]);

  /* ── Client-side search and category filtering ── */
  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      if (
        categoryFilter !== "ALL" &&
        !booking.events.some(
          (event) => event.eventType === categoryFilter
        )
      ) {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();

        const clientName =
          booking.userId?.name?.toLowerCase() ?? "";

        const eventTypes = booking.events
          .map((event) => event.eventType)
          .join(" ")
          .toLowerCase();

        if (
          !clientName.includes(query) &&
          !eventTypes.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, categoryFilter, search]);

  /* ── Event helpers ── */
  const getNarrative = (booking: BookingItem) => {
    if (booking.events.length === 0) {
      return "N/A";
    }

    if (booking.events.length === 1) {
      return booking.events[0].eventType;
    }

    return `${booking.events.length} Events`;
  };

  const getInvestment = (booking: BookingItem) => {
    if (booking.packageId) {
      return {
        price: `₹${booking.packageId.price.toLocaleString("en-IN")}`,
        label: booking.packageId.packageName.toUpperCase(),
      };
    }

    return {
      price: "Custom Quote",
      label: "NO PACKAGE",
    };
  };

  /* ── Booking actions ── */
  const triggerAction = (
    bookingId: string,
    action: "ACCEPTED" | "REJECTED"
  ) => {
    setOpenMenuId(null);
    setConfirmState({ bookingId, action });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;

    setActionLoading(true);

    try {
      await bookingService.updateBookingStatus(
        confirmState.bookingId,
        confirmState.action
      );

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === confirmState.bookingId
            ? { ...booking, status: confirmState.action }
            : booking
        )
      );

      toast.success(
        confirmState.action === "ACCEPTED"
          ? "Booking accepted successfully."
          : "Booking declined."
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to update booking status.")
      );
    } finally {
      setActionLoading(false);
      setConfirmState(null);
    }
  };

  /* ── Table columns ── */
  const columns: Column<BookingItem>[] = useMemo(
    () => [
      {
        key: "client",
        header: "Client Identity",
        width: "22%",
        render: (booking) => {
          const name = booking.userId?.name;
          const initials = getInitials(name);
          const location = booking.events[0]?.location ?? "—";

          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${avatarColor(name)}`}
              >
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {name ?? "—"}
                </p>

                <p className="text-[11px] text-text-secondary truncate mt-0.5">
                  {location}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "narrative",
        header: "Event Narrative",
        width: "24%",
        render: (booking) => {
          const narrative = getNarrative(booking);
          const category = booking.events[0]?.eventType ?? "—";

          return (
            <div>
              <p className="text-sm text-text font-medium">
                {narrative}
              </p>

              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-primary/8 border border-primary/15 text-[10px] font-semibold text-primary/80 uppercase tracking-wide">
                {category}
              </span>
            </div>
          );
        },
      },
      {
        key: "submission",
        header: "Submission",
        width: "13%",
        render: (booking) => (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <CalendarDays
              size={12}
              className="flex-shrink-0 text-text-secondary/50"
            />
            <span>{formatDate(booking.createdAt)}</span>
          </div>
        ),
      },
      {
        key: "investment",
        header: "Investment",
        width: "15%",
        render: (booking) => {
          const investment = getInvestment(booking);

          return (
            <div>
              <p className="text-sm font-bold text-white">
                {investment.price}
              </p>

              <p className="text-[10px] text-text-secondary/50 uppercase tracking-wider mt-0.5">
                {investment.label}
              </p>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: "14%",
        render: (booking) => {
          const config =
            STATUS_CONFIG[booking.status] ??
            STATUS_CONFIG.PENDING;

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${config.pill}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`}
              />
              {config.label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        width: "10%",
        render: (booking) => {
          if (booking.status !== "PENDING") {
            return <div className="w-8" />;
          }

          const isOpen = openMenuId === booking._id;

          return (
            <div className="relative flex justify-end">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId(isOpen ? null : booking._id);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/8 transition cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-36 bg-[#111214] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      triggerAction(booking._id, "ACCEPTED")
                    }
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/8 transition cursor-pointer"
                  >
                    <Check size={13} />
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      triggerAction(booking._id, "REJECTED")
                    }
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/8 transition cursor-pointer"
                  >
                    <X size={13} />
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [openMenuId]
  );

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#070708] text-text font-body flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#070708]/90 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search bookings, clients..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#111214] border border-white/8 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:border-primary/40 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text leading-none">
              {user?.name ?? "Photographer"}
            </p>

            <p className="text-[10px] text-primary/70 uppercase tracking-widest mt-0.5">
              Lead Artist
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "P"}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-8 py-10 max-w-7xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-white tracking-tight mb-1.5">
            Booking Requests
          </h1>

          <p className="text-text-secondary text-sm">
            Review and manage your incoming elite photography sessions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Status filter */}
          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setStatusOpen((value) => !value);
                setCategoryOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111214] border border-white/8 text-sm hover:border-primary/30 transition cursor-pointer select-none"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/50">
                Status:
              </span>

              <span className="text-primary font-medium">
                {statusFilter === "ALL"
                  ? "All Requests"
                  : statusFilter.charAt(0) +
                    statusFilter.slice(1).toLowerCase()}
              </span>

              <ChevronDown
                size={13}
                className={`text-text-secondary transition-transform ${statusOpen ? "rotate-180" : ""}`}
              />
            </button>

            {statusOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-44 bg-[#111214] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                {(
                  [
                    "ALL",
                    "PENDING",
                    "ACCEPTED",
                    "REJECTED",
                    "CANCELLED",
                    "COMPLETED",
                  ] as StatusFilter[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setStatusOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                      statusFilter === status
                        ? "text-primary bg-primary/5"
                        : "text-text-secondary hover:text-text hover:bg-white/5"
                    }`}
                  >
                    {status === "ALL"
                      ? "All Requests"
                      : status.charAt(0) +
                        status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setCategoryOpen((value) => !value);
                setStatusOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111214] border border-white/8 text-sm hover:border-primary/30 transition cursor-pointer select-none"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/50">
                Category:
              </span>

              <span className="text-primary font-medium">
                {categoryFilter === "ALL"
                  ? "All Events"
                  : categoryFilter}
              </span>

              <ChevronDown
                size={13}
                className={`text-text-secondary transition-transform ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-44 bg-[#111214] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                {["ALL", ...categories].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setCategoryFilter(category);
                      setCategoryOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                      categoryFilter === category
                        ? "text-primary bg-primary/5"
                        : "text-text-secondary hover:text-text hover:bg-white/5"
                    }`}
                  >
                    {category === "ALL"
                      ? "All Events"
                      : category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings table */}
        <Table<BookingItem>
          data={filtered}
          columns={columns}
          keyExtractor={(booking) => booking._id}
          loading={loading}
          loadingMessage="Loading booking requests…"
          emptyMessage={
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Inbox
                size={36}
                className="text-text-secondary/25"
              />

              <p className="text-sm text-text-secondary">
                No booking requests found.
              </p>

              {(statusFilter !== "ALL" ||
                categoryFilter !== "ALL" ||
                search.trim() !== "") && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCategoryFilter("ALL");
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          }
          pagination={
            total > PAGE_SIZE
              ? {
                  currentPage: page,
                  totalPages,
                  totalItems: total,
                  pageSize: PAGE_SIZE,
                  onPageChange: (nextPage) => {
                    setPage(nextPage);
                  },
                }
              : undefined
          }
        />

        {/* Correct server pagination summary */}
        {!loading && total > 0 && (
          <p className="mt-3 text-xs text-text-secondary/40">
            Showing{" "}
            <span className="text-text-secondary/60">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)}
            </span>{" "}
            of{" "}
            <span className="text-text-secondary/60">
              {total}
            </span>{" "}
            booking requests
          </p>
        )}

        {/* Footer */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-text-secondary/30 border-t border-white/5 pt-6">
          <span>© 2024 Lumora. All rights reserved.</span>

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="hover:text-text-secondary transition"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="hover:text-text-secondary transition"
            >
              Terms of Service
            </a>

            <a
              href="#"
              className="hover:text-text-secondary transition"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </main>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={!!confirmState}
        onClose={() =>
          !actionLoading && setConfirmState(null)
        }
        onConfirm={handleConfirm}
        loading={actionLoading}
        title={
          confirmState?.action === "ACCEPTED"
            ? "Accept Booking?"
            : "Decline Booking?"
        }
        description={
          confirmState?.action === "ACCEPTED"
            ? "This will notify the client and confirm the session on your calendar."
            : "This will notify the client that the session has been declined."
        }
        confirmText={
          confirmState?.action === "ACCEPTED"
            ? "Yes, Accept"
            : "Yes, Decline"
        }
        cancelText="Cancel"
        variant={
          confirmState?.action === "ACCEPTED"
            ? "primary"
            : "danger"
        }
      />
    </div>
  );
};

export default PhotographerBookings;

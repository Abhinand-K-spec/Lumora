import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
  Receipt,
  User,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  paymentService,
  type PaymentItem,
  type PaymentCounterpartInfo,
  type PaymentBookingInfo,
  type PaymentQuotationInfo,
} from "../../services/paymentService";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserPayments = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getUserPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load user payments:", err);
      toast.error("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const successPayments = payments.filter((p) => p.status === "SUCCESS");
    const pendingPayments = payments.filter((p) => p.status === "PENDING");

    const totalPaid = successPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const pendingAmount = pendingPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    return {
      totalPaid,
      completedCount: successPayments.length,
      pendingAmount,
      pendingCount: pendingPayments.length,
      totalCount: payments.length,
    };
  }, [payments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Status filter
      if (statusFilter !== "ALL" && payment.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && payment.paymentType !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const photographer =
          typeof payment.photographerId === "object"
            ? (payment.photographerId as PaymentCounterpartInfo)
            : null;
        const booking =
          typeof payment.bookingId === "object"
            ? (payment.bookingId as PaymentBookingInfo)
            : null;
        const quotation =
          typeof payment.quotationId === "object"
            ? (payment.quotationId as PaymentQuotationInfo)
            : null;

        const photographerName = photographer?.name?.toLowerCase() || "";
        const photographerEmail = photographer?.email?.toLowerCase() || "";
        const quotationNumber = quotation?.quotationNumber?.toLowerCase() || "";
        const gatewayPaymentId = payment.gatewayPaymentId?.toLowerCase() || "";
        const gatewayOrderId = payment.gatewayOrderId?.toLowerCase() || "";
        const eventNames =
          booking?.events?.map((e) => e.eventType.toLowerCase()).join(" ") || "";

        return (
          photographerName.includes(q) ||
          photographerEmail.includes(q) ||
          quotationNumber.includes(q) ||
          gatewayPaymentId.includes(q) ||
          gatewayOrderId.includes(q) ||
          eventNames.includes(q)
        );
      }

      return true;
    });
  }, [payments, statusFilter, typeFilter, searchQuery]);

  const getStatusBadge = (status: PaymentItem["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock size={12} />
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={12} />
            Failed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-text-secondary border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-white tracking-wide">
            Payment History
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track advance deposits, completed payments, and invoices for your bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-text-secondary hover:text-white transition cursor-pointer"
          >
            <span>My Bookings</span>
            <ArrowRight size={13} />
          </Link>
          <button
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Paid */}
        <div className="rounded-2xl border border-white/10 bg-[#0f1012] p-5 space-y-2">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Paid
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatCurrency(metrics.totalPaid)}
          </div>
          <p className="text-[11px] text-text-secondary">
            Securely settled across <span className="text-emerald-400 font-semibold">{metrics.completedCount}</span> transactions.
          </p>
        </div>

        {/* Pending Advance */}
        <div className="rounded-2xl border border-white/10 bg-[#0f1012] p-5 space-y-2">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending Payments
            </span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-400">
            {formatCurrency(metrics.pendingAmount)}
          </div>
          <p className="text-[11px] text-text-secondary">
            <span className="text-yellow-400 font-semibold">{metrics.pendingCount}</span> payment orders awaiting completion.
          </p>
        </div>

        {/* Total Processed */}
        <div className="rounded-2xl border border-white/10 bg-[#0f1012] p-5 space-y-2">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {metrics.totalCount}
          </div>
          <p className="text-[11px] text-text-secondary">
            Processed via Razorpay with encrypted receipts sent to email.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search by photographer, quotation #, or payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#0f1012] text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/50 transition"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1 bg-[#0f1012]">
            {["ALL", "SUCCESS", "PENDING", "FAILED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === status
                    ? "bg-primary text-black"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {status === "ALL" ? "All Status" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1 bg-[#0f1012]">
            {["ALL", "ADVANCE", "FINAL"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === type
                    ? "bg-white/15 text-white"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {type === "ALL" ? "All Types" : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-20 border border-white/10 border-dashed rounded-2xl bg-[#070708] space-y-4">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {payments.length === 0 ? "No Payments Recorded Yet" : "No Matching Payments Found"}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {payments.length === 0
              ? "When you accept formal quotations and pay advance deposits, your receipts and transaction history will appear here."
              : "Try clearing your filters or searching with a different keyword."}
          </p>
          {payments.length === 0 && (
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              <span>View My Bookings</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1012]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-text-secondary">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Photographer</th>
                  <th className="px-5 py-3.5 font-semibold">Shoot / Event</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Paid On</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPayments.map((payment) => {
                  const photographer =
                    typeof payment.photographerId === "object"
                      ? (payment.photographerId as PaymentCounterpartInfo)
                      : null;
                  const booking =
                    typeof payment.bookingId === "object"
                      ? (payment.bookingId as PaymentBookingInfo)
                      : null;
                  const quotation =
                    typeof payment.quotationId === "object"
                      ? (payment.quotationId as PaymentQuotationInfo)
                      : null;

                  const firstEvent = booking?.events?.[0];

                  return (
                    <tr
                      key={payment._id}
                      className="hover:bg-white/[0.015] transition"
                    >
                      {/* Photographer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                            {photographer?.name ? photographer.name.charAt(0).toUpperCase() : <User size={13} />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {photographer?.name || "Photographer"}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {photographer?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shoot / Event */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {firstEvent?.eventType || "Photography Booking"}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                            {firstEvent?.eventDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} className="text-primary" />
                                {new Date(firstEvent.eventDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                            {quotation?.quotationNumber && (
                              <span className="text-text-secondary/60">
                                • Quote #{quotation.quotationNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white/5 text-text-secondary border border-white/10">
                          {payment.paymentType}
                        </span>
                      </td>

                      {/* Paid Date */}
                      <td className="px-5 py-4 text-text-secondary font-mono text-[11px]">
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {getStatusBadge(payment.status)}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-sm text-primary font-mono">
                          {formatCurrency(payment.amount)}
                        </span>
                        {payment.gatewayPaymentId && (
                          <p className="text-[10px] text-text-secondary/60 font-mono mt-0.5">
                            {payment.gatewayPaymentId}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPayments;


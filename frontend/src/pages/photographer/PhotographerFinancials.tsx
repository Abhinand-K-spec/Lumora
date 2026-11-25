import { useEffect, useState, useMemo } from "react";
import {
  Coins,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
  CreditCard,
  Receipt,
  User,
  Loader2,
  RefreshCw,
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

const PhotographerFinancials = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPhotographerPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load photographer payments:", err);
      toast.error("Failed to load earnings and payments.");
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

    const totalEarnings = successPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const pendingAmount = pendingPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    return {
      totalEarnings,
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
        const client = typeof payment.userId === "object" ? (payment.userId as PaymentCounterpartInfo) : null;
        const booking = typeof payment.bookingId === "object" ? (payment.bookingId as PaymentBookingInfo) : null;
        const quotation = typeof payment.quotationId === "object" ? (payment.quotationId as PaymentQuotationInfo) : null;

        const clientName = client?.name?.toLowerCase() || "";
        const clientEmail = client?.email?.toLowerCase() || "";
        const quotationNumber = quotation?.quotationNumber?.toLowerCase() || "";
        const gatewayPaymentId = payment.gatewayPaymentId?.toLowerCase() || "";
        const gatewayOrderId = payment.gatewayOrderId?.toLowerCase() || "";
        const eventNames = booking?.events?.map((e) => e.eventType.toLowerCase()).join(" ") || "";

        return (
          clientName.includes(q) ||
          clientEmail.includes(q) ||
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
            Success
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
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8 bg-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Coins size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-semibold text-white tracking-wide">
                Financials & Earnings
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Track client advance payments, completed settlements, and transaction history.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/[0.06] transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Earned */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070708] p-6 space-y-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Received
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatCurrency(metrics.totalEarnings)}
          </div>
          <p className="text-[11px] text-text-secondary">
            Across <span className="text-emerald-400 font-semibold">{metrics.completedCount}</span> completed payout transactions.
          </p>
        </div>

        {/* Pending Deposits */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070708] p-6 space-y-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Awaiting Clearance
            </span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-400">
            {formatCurrency(metrics.pendingAmount)}
          </div>
          <p className="text-[11px] text-text-secondary">
            <span className="text-yellow-400 font-semibold">{metrics.pendingCount}</span> payment orders initiated by clients.
          </p>
        </div>

        {/* Total Transactions */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070708] p-6 space-y-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {metrics.totalCount}
          </div>
          <p className="text-[11px] text-text-secondary">
            Verified gateway transactions processed via Razorpay.
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
            placeholder="Search by client name, quotation #, or payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#0f1012] text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/50 transition"
          />
        </div>

        {/* Filter Badges */}
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

      {/* Transactions List */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-20 border border-white/10 border-dashed rounded-2xl bg-[#070708] space-y-3">
          <Receipt className="w-10 h-10 text-text-secondary/40 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            {payments.length === 0 ? "No Transactions Yet" : "No Matching Transactions"}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {payments.length === 0
              ? "When clients confirm quotations and pay advance deposits, transactions will appear here automatically."
              : "Try adjusting your search query or status filters to view records."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070708]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-text-secondary">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Client</th>
                  <th className="px-5 py-3.5 font-semibold">Booking / Event</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPayments.map((payment) => {
                  const client =
                    typeof payment.userId === "object"
                      ? (payment.userId as PaymentCounterpartInfo)
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
                      {/* Client */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {client?.name ? client.name.charAt(0).toUpperCase() : <User size={13} />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {client?.name || "Client"}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {client?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Booking / Event */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {firstEvent?.eventType || "Photography Shoot"}
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
                                • #{quotation.quotationNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Payment Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white/5 text-text-secondary border border-white/10">
                          {payment.paymentType}
                        </span>
                      </td>

                      {/* Date */}
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

export default PhotographerFinancials;

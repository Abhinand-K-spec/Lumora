import { useState } from "react";
import {
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import quotationService, {
  type QuotationItem,
} from "../../../services/quotationService";
import ConfirmationModal from "../../common/ConfirmationModal";
import AdvancePaymentButton from "../../payment/AdvancePaymentButton";

interface UserQuotationModalProps {
  isOpen: boolean;
  quotation: QuotationItem | null;
  photographerName?: string;
  paymentStatus?: "PENDING" | "PARTIALLY_PAID" | "PAID";
  advancePaid?: number;
  onClose: () => void;
  onStatusChange?: (updated: QuotationItem) => void;
  onPaymentSuccess?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const UserQuotationModal = ({
  isOpen,
  quotation,
  photographerName = "Photographer",
  paymentStatus = "PENDING",
  advancePaid = 0,
  onClose,
  onStatusChange,
  onPaymentSuccess,
}: UserQuotationModalProps) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!isOpen || !quotation) return null;

  const isExpired =
    new Date(quotation.validUntil).getTime() < Date.now() &&
    quotation.status === "SENT";

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const res = await quotationService.accept(quotation._id);
      const updated = res.data ?? { ...quotation, status: "ACCEPTED" as const };
      toast.success("Quotation accepted successfully.");
      onStatusChange?.(updated);
      setIsAcceptModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to accept quotation.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();
    if (reason.length < 5) {
      toast.error("Please provide a reason with at least 5 characters.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await quotationService.reject(quotation._id, reason);
      const updated = res.data ?? {
        ...quotation,
        status: "REJECTED" as const,
        rejectionReason: reason,
      };
      toast.success("Quotation declined.");
      onStatusChange?.(updated);
      setIsDeclineModalOpen(false);
      setRejectionReason("");
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to decline quotation.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-400 bg-white/5 border border-white/10">
          <Clock size={12} /> Expired
        </span>
      );
    }

    switch (quotation.status) {
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case "SENT":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-[#F2C94C] bg-[#F2C94C]/10 border border-[#F2C94C]/25">
            <Clock size={12} /> Awaiting Your Response
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/25">
            <XCircle size={12} /> Declined
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-gray-400 bg-white/5 border border-white/10">
            {quotation.status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          onClick={actionLoading ? undefined : onClose}
        />

        {/* Modal Window */}
        <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1012] shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-4.5 bg-[#121316]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Receipt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-heading font-semibold text-white">
                    Quotation #{quotation.quotationNumber}
                  </h2>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Prepared by{" "}
                  <span className="text-white font-medium">
                    {photographerName}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Validity Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#070708] p-3.5 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <CalendarDays size={14} className="text-primary" />
                <span>Valid Until:</span>
                <span className="font-semibold text-white">
                  {formatDate(quotation.validUntil)}
                </span>
              </div>
              <div className="text-[11px] text-text-secondary/70">
                Created: {formatDate(quotation.createdAt)}
              </div>
            </div>

            {/* Rejection notice if declined */}
            {quotation.status === "REJECTED" && quotation.rejectionReason && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 space-y-1">
                <p className="text-xs font-semibold text-red-400">
                  You declined this quotation
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Reason: &ldquo;{quotation.rejectionReason}&rdquo;
                </p>
              </div>
            )}

            {/* Accepted notice */}
            {quotation.status === "ACCEPTED" && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 size={16} />
                  <span>Quotation accepted successfully.</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Advance required</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(quotation.advanceAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Advance paid</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(advancePaid)}
                  </span>
                </div>

                {paymentStatus === "PENDING" && (
                  <AdvancePaymentButton
                    quotationId={quotation._id}
                    advanceAmount={quotation.advanceAmount}
                    onPaymentSuccess={() => onPaymentSuccess?.()}
                  />
                )}

                {paymentStatus === "PARTIALLY_PAID" && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <p className="text-xs font-semibold text-emerald-400">
                      Advance payment received
                    </p>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Your advance payment has been successfully recorded.
                    </p>
                  </div>
                )}

                {paymentStatus === "PAID" && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <p className="text-xs font-semibold text-emerald-400">
                      Fully paid
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Line Items Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Itemized Services & Equipment
              </h3>
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#070708]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02] text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Service</th>
                      <th className="px-3 py-3 font-semibold text-center w-16">
                        Qty
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Rate
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {quotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.015]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-text-secondary mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-text-secondary">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-white font-mono">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-xl border border-white/[0.08] bg-[#070708] p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Financial Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">
                    {formatCurrency(quotation.subtotal)}
                  </span>
                </div>

                {quotation.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>- {formatCurrency(quotation.discount)}</span>
                  </div>
                )}

                {quotation.tax > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax</span>
                    <span className="font-medium text-white">
                      + {formatCurrency(quotation.tax)}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-white">
                    Grand Total
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>

                {/* Advance strip */}
                <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3.5 flex items-center justify-between gap-4 mt-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-primary font-bold block">
                      Advance Required to Book
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      Remaining balance of{" "}
                      {formatCurrency(quotation.remainingAmount)} upon
                      completion.
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary font-mono shrink-0">
                    {formatCurrency(quotation.advanceAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Photographer Notes */}
            {quotation.notes && (
              <div className="rounded-xl border border-white/[0.06] bg-[#070708] p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Photographer Notes & Terms
                </p>
                <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                  {quotation.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#121316] px-6 py-4">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              Close
            </button>

            {quotation.status === "SENT" && !isExpired && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={actionLoading}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => setIsAcceptModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-black hover:bg-primary/90 transition shadow-lg shadow-primary/15 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Accept Quotation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation to Accept */}
      <ConfirmationModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleAccept}
        title="Accept Quotation?"
        description={`You are about to accept the quotation for ${formatCurrency(
          quotation.total
        )} with an advance deposit requirement of ${formatCurrency(
          quotation.advanceAmount
        )}. This will confirm your intent with ${photographerName}.`}
        confirmText="Yes, Accept Quotation"
        cancelText="Cancel"
        variant="primary"
        loading={actionLoading}
      />

      {/* Decline Reason Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !actionLoading && setIsDeclineModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1012] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-semibold text-white">
                Decline Quotation
              </h3>
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                disabled={actionLoading}
                className="text-text-secondary hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Please share the reason for declining so the photographer can
              adjust terms or provide an alternative quote.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., The advance amount is higher than expected / would like to remove certain items..."
              rows={4}
              disabled={actionLoading}
              className="w-full rounded-xl border border-white/10 bg-[#070708] px-3.5 py-2.5 text-xs text-white placeholder:text-text-secondary/40 focus:border-red-400 focus:outline-none transition resize-none"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                disabled={actionLoading}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || rejectionReason.trim().length < 5}
                className="rounded-xl bg-red-500 hover:bg-red-600 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-40 cursor-pointer"
              >
                {actionLoading ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserQuotationModal;

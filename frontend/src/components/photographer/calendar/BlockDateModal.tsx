// frontend/src/components/photographer/availability/BlockDatesModal.tsx
import { useState } from "react";
import { X, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import availabilityService from "../../../services/availabilityService";
import { getErrorMessage } from "../../../utils/errorUtils";

interface BlockDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string; // e.g. clicked day in calendar
}

export default function BlockDatesModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}: BlockDatesModalProps) {
  const [startDate, setStartDate] = useState(initialDate || "");
  const [endDate, setEndDate] = useState(initialDate || "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
    if (startDate > endDate) {
      toast.error("End date must be on or after start date.");
      return;
    }

    try {
      setSubmitting(true);
      await availabilityService.blockDates({
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });
      toast.success("Dates blocked successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to block dates."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1012] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-heading">
                Block Availability
              </h2>
              <p className="text-[11px] text-text-secondary">
                Prevent clients from requesting shoots on these dates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-secondary/70 tracking-wider">
                Start Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-[#070708] px-3 py-2 text-white outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-secondary/70 tracking-wider">
                End Date *
              </label>
              <input
                type="date"
                required
                min={startDate || new Date().toISOString().slice(0, 10)}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#070708] px-3 py-2 text-white outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-secondary/70 tracking-wider">
              Reason (Optional)
            </label>
            <input
              type="text"
              maxLength={250}
              placeholder="e.g., Vacation, Equipment Maintenance, Personal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#070708] px-3 py-2 text-white outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black font-semibold hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Lock size={13} />
              )}
              <span>Block Dates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
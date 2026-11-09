import { useMemo, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  Loader2,
  Send,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import type { BookingItem } from "../../../services/bookingService";
import quotationService, {
  type CreateQuotationDTO,
  type QuotationItem,
} from "../../../services/quotationService";

interface CreateQuotationModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onSuccess?: (quotation: QuotationItem) => void;
}

interface QuotationFormItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
}

const createEmptyItem = (): QuotationFormItem => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  quantity: 1,
  unitPrice: "0",
});

const getLocalDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const CreateQuotationModal = ({
  isOpen,
  booking,
  onClose,
  onSuccess,
}: CreateQuotationModalProps) => {
  const [items, setItems] = useState<QuotationFormItem[]>([createEmptyItem()]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>(getLocalDate());
  const [quotationNote, setQuotationNote] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMode, setSubmitMode] = useState<"send" | "draft">("send");

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice || 0);
      const quantity = Number(item.quantity || 0);
      return sum + unitPrice * quantity;
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + tax);
  }, [subtotal, discount, tax]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, total - advanceAmount);
  }, [total, advanceAmount]);

  const updateItem = (
    itemId: string,
    field: keyof Omit<QuotationFormItem, "id">,
    value: string | number,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
  };

  const removeItem = (itemId: string) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        toast.error("A quotation must contain at least one item.");
        return currentItems;
      }
      return currentItems.filter((item) => item.id !== itemId);
    });
  };

  const resetForm = () => {
    setItems([createEmptyItem()]);
    setDiscount(0);
    setTax(0);
    setAdvanceAmount(0);
    setValidUntil(getLocalDate());
    setQuotationNote("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (items.length === 0) {
      toast.error("Add at least one quotation item.");
      return false;
    }

    const hasEmptyItemName = items.some((item) => !item.name.trim());
    if (hasEmptyItemName) {
      toast.error("Please enter a name for every quotation item.");
      return false;
    }

    const hasInvalidQuantity = items.some(
      (item) => !Number.isFinite(item.quantity) || item.quantity <= 0,
    );
    if (hasInvalidQuantity) {
      toast.error("Quantity must be greater than zero.");
      return false;
    }

    const hasInvalidUnitPrice = items.some(
      (item) =>
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0 ||
        item.unitPrice.trim() === "",
    );
    if (hasInvalidUnitPrice) {
      toast.error("Please enter a valid unit price.");
      return false;
    }

    if (!Number.isFinite(discount) || discount < 0) {
      toast.error("Discount cannot be negative.");
      return false;
    }

    if (discount > subtotal) {
      toast.error("Discount cannot be greater than the subtotal.");
      return false;
    }

    if (!Number.isFinite(tax) || tax < 0) {
      toast.error("Tax cannot be negative.");
      return false;
    }

    if (!Number.isFinite(advanceAmount) || advanceAmount < 0) {
      toast.error("Advance amount cannot be negative.");
      return false;
    }

    if (advanceAmount > total) {
      toast.error("Advance amount cannot be greater than the total.");
      return false;
    }

    if (!validUntil) {
      toast.error("Please select a quotation validity date.");
      return false;
    }

    const selectedDate = new Date(`${validUntil}T23:59:59`);
    const now = new Date();
    if (selectedDate.getTime() < now.getTime()) {
      toast.error("The quotation validity date must be in the future.");
      return false;
    }

    return true;
  };

  const handleSaveQuotation = async (mode: "send" | "draft") => {
    if (!booking) return;
    if (!validateForm()) return;

    setSubmitMode(mode);
    setIsSubmitting(true);

    const payload: CreateQuotationDTO = {
      items: items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim() || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      discount,
      tax,
      advanceAmount,
      validUntil: new Date(`${validUntil}T23:59:59`).toISOString(),
      notes: quotationNote.trim() || undefined,
    };

    try {
      const response = await quotationService.create(booking._id, payload);
      let quotation = response?.data;

      if (!quotation?._id) {
        throw new Error("Quotation creation failed: ID missing in response.");
      }

      if (mode === "send") {
        const sendResponse = await quotationService.send(quotation._id);
        quotation = sendResponse.data ?? { ...quotation, status: "SENT" };
        toast.success("Quotation created and sent to client.");
      } else {
        toast.success("Quotation saved as draft.");
      }

      onSuccess?.(quotation);
      resetForm();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process quotation.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  const eventLabel =
    booking.events?.[0]?.eventType ?? "Photography Event";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1012] shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-4.5 bg-[#121316]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-heading font-semibold text-white">
                Create Quotation
              </h2>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                {eventLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-secondary">
              Prepare an itemized quotation for {booking.userId?.name || "the client"}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-white transition disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Booking Summary strip */}
          <div className="rounded-xl border border-white/[0.06] bg-[#070708] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <FileText size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {booking.userId?.name || "Client"}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {booking.userId?.email || "No email"} {booking.userId?.phone ? `• ${booking.userId.phone}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-secondary">
              {booking.packageId && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary/60 block">
                    Base Package
                  </span>
                  <span className="text-primary font-medium">
                    {booking.packageId.packageName} (₹{booking.packageId.price.toLocaleString("en-IN")})
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-secondary/60 block">
                  Event Dates
                </span>
                <span className="text-white">
                  {booking.events?.length || 0} scheduled
                </span>
              </div>
            </div>
          </div>

          {/* Quotation Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Line Items & Services ({items.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const itemTotal =
                  Number(item.quantity || 0) * Number(item.unitPrice || 0);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/[0.08] bg-[#070708] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                        Item {index + 1}
                      </span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isSubmitting}
                          className="text-text-secondary hover:text-red-400 p-1 rounded-md transition cursor-pointer"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-6">
                        <label className="text-[11px] text-text-secondary block mb-1">
                          Service / Item Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="e.g., Candid Wedding Photography"
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white placeholder:text-text-secondary/40 focus:border-primary/50 focus:outline-none transition"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-text-secondary block mb-1">
                          Qty <span className="text-primary">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                          }
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-text-secondary block mb-1">
                          Rate (₹) <span className="text-primary">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, "unitPrice", e.target.value)
                          }
                          placeholder="0"
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="sm:col-span-2 flex flex-col justify-end">
                        <label className="text-[11px] text-text-secondary/60 block mb-1">
                          Line Total
                        </label>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs font-semibold text-white truncate">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-12">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Optional specifications or deliverables..."
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-white/[0.06] bg-[#0f1012] px-3 py-1.5 text-[11px] text-text-secondary placeholder:text-text-secondary/30 focus:border-primary/40 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Adjustments & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Inputs: Discount, Tax, Advance */}
            <div className="rounded-xl border border-white/[0.08] bg-[#070708] p-4.5 space-y-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Financial Terms
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    value={discount || ""}
                    onChange={(e) =>
                      setDiscount(Math.max(0, Number(e.target.value) || 0))
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Tax / GST (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tax || ""}
                    onChange={(e) =>
                      setTax(Math.max(0, Number(e.target.value) || 0))
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-primary font-medium block mb-1">
                    Advance Deposit Required (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={total}
                    value={advanceAmount || ""}
                    onChange={(e) =>
                      setAdvanceAmount(Math.max(0, Number(e.target.value) || 0))
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-primary/30 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition"
                  />
                  <p className="text-[10px] text-text-secondary/60 mt-1">
                    Amount the customer must pay to confirm the booking.
                  </p>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-xl border border-white/[0.08] bg-[#070708] p-4.5 flex flex-col justify-between space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Calculation Summary
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}

                {tax > 0 && (
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Tax</span>
                    <span className="font-medium text-white">+ {formatCurrency(tax)}</span>
                  </div>
                )}

                <div className="border-t border-white/[0.08] pt-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Grand Total</span>
                  <span className="text-base font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-3 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Advance Payable:</span>
                    <span className="font-bold text-primary">{formatCurrency(advanceAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary">
                    <span>Remaining Balance:</span>
                    <span className="font-medium text-white">{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="text-[11px] text-text-secondary block mb-1">
                  Valid Until <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={getLocalDate()}
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-white/10 bg-[#0f1012] px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1.5">
              Client Notes & Terms
            </label>
            <textarea
              value={quotationNote}
              onChange={(e) => setQuotationNote(e.target.value)}
              placeholder="Specify deliverables timeline, overtime terms, equipment details, or notes for the customer..."
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#070708] px-3.5 py-2.5 text-xs text-white placeholder:text-text-secondary/40 focus:border-primary/50 focus:outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#121316] px-6 py-4 gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSaveQuotation("draft")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && submitMode === "draft" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSaveQuotation("send")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-black hover:bg-primary/90 transition shadow-lg shadow-primary/15 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && submitMode === "send" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Quotation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
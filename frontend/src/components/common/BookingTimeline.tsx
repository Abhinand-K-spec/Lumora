import { Check, X } from "lucide-react";
import type { BookingItem } from "../../services/bookingService";
import type { QuotationStatus } from "../../services/quotationService";

interface BookingTimelineProps {
  bookingStatus: BookingItem["status"];
  quotationStatus?: QuotationStatus;
  paymentStatus?: BookingItem["paymentStatus"];
}

type StepState = "done" | "active" | "pending" | "failed";

interface Step {
  label: string;
  state: StepState;
}

const BookingTimeline = ({
  bookingStatus,
  quotationStatus,
  paymentStatus,
}: BookingTimelineProps) => {
  const bookingAcceptedState = (): StepState => {
    if (bookingStatus === "ACCEPTED" || bookingStatus === "COMPLETED") return "done";
    if (bookingStatus === "REJECTED") return "failed";
    if (bookingStatus === "CANCELLED") return "pending";
    return "active";
  };

  const quotationSentState = (): StepState => {
    if (bookingStatus === "CANCELLED" || bookingStatus === "REJECTED") return "pending";
    if (!quotationStatus || quotationStatus === "DRAFT") {
      return bookingStatus === "ACCEPTED" || bookingStatus === "COMPLETED"
        ? "active"
        : "pending";
    }
    return "done";
  };

  const quotationAcceptedState = (): StepState => {
    if (bookingStatus === "CANCELLED" || bookingStatus === "REJECTED") return "pending";
    if (quotationStatus === "ACCEPTED") return "done";
    if (quotationStatus === "REJECTED") return "failed";
    if (quotationStatus === "SENT") return "active";
    return "pending";
  };

  const advancePaymentState = (): StepState => {
    if (bookingStatus === "CANCELLED" || bookingStatus === "REJECTED") return "pending";
    if (quotationStatus !== "ACCEPTED") return "pending";
    if (paymentStatus === "PARTIALLY_PAID" || paymentStatus === "PAID") return "done";
    return "active";
  };

  const fullPaymentState = (): StepState => {
    if (bookingStatus === "CANCELLED" || bookingStatus === "REJECTED") return "pending";
    if (paymentStatus === "PAID" || bookingStatus === "COMPLETED") return "done";
    if (paymentStatus === "PARTIALLY_PAID") return "active";
    return "pending";
  };

  const steps: Step[] = [
    { label: "Booking Sent", state: "done" },
    { label: "Booking Accepted", state: bookingAcceptedState() },
    { label: "Quotation Sent", state: quotationSentState() },
    { label: "Quotation Accepted", state: quotationAcceptedState() },
    { label: "Advance Payment", state: advancePaymentState() },
    { label: "Full Payment", state: fullPaymentState() },
  ];

  const dotClass = (state: StepState) => {
    switch (state) {
      case "done":
        return "bg-primary border-primary text-black";
      case "active":
        return "bg-transparent border-primary text-primary";
      case "failed":
        return "bg-red-500/10 border-red-500 text-red-400";
      default:
        return "bg-transparent border-white/15 text-transparent";
    }
  };

  const lineClass = (prevState: StepState, nextState: StepState): string => {
    if (prevState === "done" && (nextState === "done" || nextState === "active" || nextState === "failed")) {
      return "bg-primary/60";
    }
    if (nextState === "failed") return "bg-red-500/40";
    return "bg-white/[0.08]";
  };

  const labelClass = (state: StepState) => {
    switch (state) {
      case "done":
        return "text-white";
      case "active":
        return "text-primary";
      case "failed":
        return "text-red-400";
      default:
        return "text-text-secondary/40";
    }
  };

  return (
    <div className="pt-1">
      <p className="text-[9px] uppercase tracking-widest font-bold text-text-secondary/40 mb-3">
        Booking Progress
      </p>
      <div className="flex items-start">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${dotClass(step.state)}`}
              >
                {step.state === "done" && <Check size={11} strokeWidth={3} />}
                {step.state === "failed" && <X size={11} strokeWidth={3} />}
                {step.state === "active" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <p
                className={`mt-1.5 text-center text-[10px] font-medium leading-tight w-16 ${labelClass(step.state)}`}
              >
                {step.label}
              </p>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mt-3 mx-1 rounded-full transition-all ${lineClass(step.state, steps[idx + 1].state)}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTimeline;

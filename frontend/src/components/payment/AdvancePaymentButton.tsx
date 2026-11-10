
import { useState } from "react";
import { paymentService } from "../../services/paymentService";
import { toast } from "sonner";

interface AdvancePaymentButtonProps {
  quotationId: string;
  advanceAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

export default function AdvancePaymentButton({
  quotationId,
  advanceAmount,
  customerName,
  customerEmail,
  customerContact,
  onPaymentSuccess,
}: AdvancePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error("Unable to load payment gateway");
        return;
      }

      const order = await paymentService.createAdvanceOrder(
        quotationId
      );

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Lumora",
        description: "Photography Booking Advance Payment",
        order_id: order.orderId,

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerContact,
        },

        theme: {
          color: "#C5A059",
        },

        handler: async (response) => {
          try {
            setVerifying(true);

            await paymentService.verifyAdvancePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Advance payment successful!");

            onPaymentSuccess();
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(
              "Payment verification failed. Please contact support if money was deducted."
            );
          } finally {
            setVerifying(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast("Payment window closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error("Unable to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || verifying}
      className="w-full rounded-xl bg-primary px-6 py-3 font-bold text-black transition hover:brightness-110 shadow-lg shadow-primary/15 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Preparing payment..."
        : verifying
          ? "Verifying payment..."
          : `Pay Advance ₹${advanceAmount.toLocaleString("en-IN")}`}
    </button>
  );
}

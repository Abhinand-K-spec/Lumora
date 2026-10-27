import { AlertTriangle, CheckCircle2, X, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle size={22} className="text-red-400" />,
          iconBg: "bg-red-500/10 border-red-500/20",
          confirmBtn:
            "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/15",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={22} className="text-[#F2C94C]" />,
          iconBg: "bg-[#F2C94C]/10 border-[#F2C94C]/20",
          confirmBtn:
            "bg-[#F2C94C] hover:bg-[#F2C94C]/90 text-black font-bold shadow-lg shadow-[#F2C94C]/15",
        };
      default:
        return {
          icon: <CheckCircle2 size={22} className="text-primary" />,
          iconBg: "bg-primary/10 border-primary/20",
          confirmBtn:
            "bg-primary text-black hover:bg-primary/90 font-bold shadow-lg shadow-primary/15",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1012] p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition cursor-pointer disabled:opacity-50"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border ${styles.iconBg}`}
          >
            {styles.icon}
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-base font-heading font-semibold text-white">
              {title}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${styles.confirmBtn}`}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

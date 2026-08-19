import { AlertTriangle, X } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  loading?: boolean;
}

const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  loading = false,
}: DeleteUserModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1 text-text-secondary hover:bg-white/5 hover:text-text transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Warning Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle size={24} />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-semibold text-text">
              Delete User Account
            </h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-text">{userName}</span>? This
              action is permanent and cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-neutral/30 hover:bg-neutral/50 text-text font-medium text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;

import { X } from "lucide-react";
import PhotographerCalendarView from "./Calendar";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
}: CalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f1012] p-6 sm:p-8 shadow-2xl space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg border border-white/10 p-1.5 text-text-secondary hover:text-white hover:bg-white/5 transition cursor-pointer z-10"
          title="Close Calendar"
        >
          <X size={18} />
        </button>

        {/* The Reusable Monthly Calendar View */}
        <PhotographerCalendarView />
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PackageItem } from "../../../services/photographerService";

interface PhotographerPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData?: PackageItem | null;
  onSave: (data: Omit<PackageItem, "_id" | "photographerId">) => void;
}

const PhotographerPackageModal = ({
  isOpen,
  onClose,
  packageData,
  onSave,
}: PhotographerPackageModalProps) => {
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [framesIncluded, setFramesIncluded] = useState(false);
  const [droneIncluded, setDroneIncluded] = useState(false);
  const [albumIncluded, setAlbumIncluded] = useState(false);
  const [videographersIncluded, setVideographersIncluded] = useState(false);
  const [status, setStatus] = useState("active");

  // Sync state when packageData changes
  useEffect(() => {
    if (packageData) {
      setPackageName(packageData.packageName);
      setPrice(packageData.price);
      setDescription(packageData.description);
      setFramesIncluded(packageData.framesIncluded);
      setDroneIncluded(packageData.droneIncluded);
      setAlbumIncluded(packageData.albumIncluded);
      setVideographersIncluded(packageData.videographersIncluded);
      setStatus(packageData.status || "active");
    } else {
      setPackageName("");
      setPrice("");
      setDescription("");
      setFramesIncluded(false);
      setDroneIncluded(false);
      setAlbumIncluded(false);
      setVideographersIncluded(false);
      setStatus("active");
    }
  }, [packageData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || price === "" || !description.trim()) return;

    onSave({
      packageName: packageName.trim(),
      price: Number(price),
      description: description.trim(),
      framesIncluded,
      droneIncluded,
      albumIncluded,
      videographersIncluded,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0f1012] border border-border/30 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-border/10 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-text tracking-wide">
            {packageData ? "Edit Package Details" : "Add Service Package"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-neutral-900 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Container (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Package Name */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1.5">Package Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Wedding Package"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition"
            />
          </div>

          {/* Price & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1.5">Price (INR)</label>
              <input
                type="number"
                required
                min={0}
                placeholder="e.g. 75000"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>



          {/* Description */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1.5">Package Description</label>
            <textarea
              rows={3}
              required
              placeholder="Provide key details, deliverables, session duration, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition resize-none leading-relaxed"
            />
          </div>

          {/* Inclusion Checkboxes Grid */}
          <div className="pt-2">
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-3">Service Inclusions</label>
            
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Album Included */}
              <label className="flex items-center gap-2.5 text-xs text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={albumIncluded}
                  onChange={(e) => setAlbumIncluded(e.target.checked)}
                  className="rounded border-border/30 bg-neutral-950 text-primary focus:ring-0 h-4 w-4"
                />
                <span>Physical Album</span>
              </label>

              {/* Drone Included */}
              <label className="flex items-center gap-2.5 text-xs text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={droneIncluded}
                  onChange={(e) => setDroneIncluded(e.target.checked)}
                  className="rounded border-border/30 bg-neutral-950 text-primary focus:ring-0 h-4 w-4"
                />
                <span>Aerial Drone</span>
              </label>

              {/* Frames Included */}
              <label className="flex items-center gap-2.5 text-xs text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={framesIncluded}
                  onChange={(e) => setFramesIncluded(e.target.checked)}
                  className="rounded border-border/30 bg-neutral-950 text-primary focus:ring-0 h-4 w-4"
                />
                <span>Custom Frames</span>
              </label>

              {/* Videographers Included */}
              <label className="flex items-center gap-2.5 text-xs text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={videographersIncluded}
                  onChange={(e) => setVideographersIncluded(e.target.checked)}
                  className="rounded border-border/30 bg-neutral-950 text-primary focus:ring-0 h-4 w-4"
                />
                <span>Videographers</span>
              </label>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-secondary transition cursor-pointer"
            >
              {packageData ? "Save Changes" : "Create Package"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PhotographerPackageModal;

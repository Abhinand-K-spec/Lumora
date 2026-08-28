import { Edit2, Plus, Trash2 } from "lucide-react";
import type { PackageItem } from "../../../services/photographerService";

interface PhotographerServicesProps {
  packages?: PackageItem[];
  onAddClick: () => void;
  onEditClick: (pkg: PackageItem) => void;
  onDeleteClick: (packageId: string) => void;
}

const formatPrice = (price: number): string => {
  if (price >= 100000) {
    const lakhs = price / 100000;
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)}L+`;
  }
  if (price >= 1000) {
    const thousands = price / 1000;
    return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K+`;
  }
  return `₹${price}`;
};


const PhotographerServices = ({
  packages = [],
  onAddClick,
  onEditClick,
  onDeleteClick,
}: PhotographerServicesProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6 select-none flex flex-col">
      
      {/* Title & Action */}
      <div className="flex items-center justify-between mb-4.5">
        <h3 className="font-heading text-lg font-semibold text-text tracking-wide">
          Service Packages
        </h3>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/45 rounded-lg text-primary text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
        >
          <Plus size={12} />
          <span>Add Package</span>
        </button>
      </div>

      {/* Package Rows */}
      <div className="space-y-3">
        {packages.length > 0 ? (
          packages.map((pkg) => {
            const isInactive = pkg.status === "inactive";
            return (
              <div
                key={pkg._id}
                className={`bg-neutral-900/40 border border-border/10 px-5 py-4 rounded-xl flex flex-col justify-between hover:border-border/35 transition-all group relative ${
                  isInactive ? "opacity-60 grayscale-[30%]" : ""
                }`}
              >
                {/* Package Name & Price */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-semibold text-text group-hover:text-primary transition-colors">
                      {pkg.packageName}
                    </h4>
                    {isInactive && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary tracking-wide">
                      {formatPrice(pkg.price)}
                    </span>
                    {/* Action buttons visible on hover */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onEditClick(pkg)}
                        className="p-1 hover:text-primary text-text-secondary transition cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(pkg._id)}
                        className="p-1 hover:text-red-400 text-text-secondary transition cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed pr-10">
                  {pkg.description}
                </p>


                {/* Inclusions Badges Row */}
                {(pkg.albumIncluded || pkg.droneIncluded || pkg.framesIncluded || pkg.videographersIncluded) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-border/5">
                    {pkg.albumIncluded && (
                      <span className="bg-primary/5 border border-primary/15 text-primary text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                        Album
                      </span>
                    )}
                    {pkg.droneIncluded && (
                      <span className="bg-primary/5 border border-primary/15 text-primary text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                        Drone
                      </span>
                    )}
                    {pkg.framesIncluded && (
                      <span className="bg-primary/5 border border-primary/15 text-primary text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                        Frames
                      </span>
                    )}
                    {pkg.videographersIncluded && (
                      <span className="bg-primary/5 border border-primary/15 text-primary text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                        Videographers
                      </span>
                    )}
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border/20 rounded-xl bg-neutral-900/10">
            <span className="text-xs text-text-secondary">No service packages added yet.</span>
            <button
              onClick={onAddClick}
              className="mt-2 text-[10px] font-bold text-primary uppercase tracking-wider hover:underline cursor-pointer"
            >
              Add your first package
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PhotographerServices;

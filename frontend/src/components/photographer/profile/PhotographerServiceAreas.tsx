import { Edit2, Plus, Trash2, MapPin, Navigation } from "lucide-react";
import type { IServiceArea } from "../../../types/serviceArea";

interface PhotographerServiceAreasProps {
  serviceAreas?: IServiceArea[];
  onAddClick: () => void;
  onEditClick: (area: IServiceArea) => void;
  onDeleteClick: (area: IServiceArea) => void;
}

const PhotographerServiceAreas = ({
  serviceAreas = [],
  onAddClick,
  onEditClick,
  onDeleteClick,
}: PhotographerServiceAreasProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6 select-none flex flex-col">
      {/* Title & Action */}
      <div className="flex items-center justify-between mb-4.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <MapPin size={16} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-text tracking-wide">
              Service Areas
            </h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Locations and radiuses where you provide photography services
            </p>
          </div>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/45 rounded-lg text-primary text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
        >
          <Plus size={12} />
          <span>Add Area</span>
        </button>
      </div>

      {/* Areas List */}
      <div className="space-y-3">
        {serviceAreas.length > 0 ? (
          serviceAreas.map((area, index) => {
            const [lng, lat] = area.center.coordinates;
            return (
              <div
                key={area._id || `${area.name}-${index}`}
                className="bg-neutral-900/40 border border-border/10 px-5 py-4 rounded-xl flex items-center justify-between hover:border-border/35 transition-all group relative"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 w-6 h-6 rounded-md bg-neutral-800/80 border border-border/15 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                    <Navigation size={12} />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-text group-hover:text-primary transition-colors">
                      {area.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        {area.radiusKm} km radius
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono">
                        {lng.toFixed(4)}°, {lat.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditClick(area)}
                    className="p-1.5 text-text-secondary hover:text-text rounded-md hover:bg-neutral-800 transition cursor-pointer"
                    title="Edit Area"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteClick(area)}
                    className="p-1.5 text-text-secondary hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition cursor-pointer"
                    title="Delete Area"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-7 px-4 rounded-xl border border-dashed border-border/20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-neutral-900/80 flex items-center justify-center text-text-secondary mb-2.5">
              <MapPin size={18} />
            </div>
            <p className="text-xs text-text-secondary font-medium">
              No service areas configured yet
            </p>
            <p className="text-[11px] text-text-secondary/70 mt-1 max-w-xs">
              Add your coverage zones with an interactive map and radius to help local clients find you.
            </p>
            <button
              onClick={onAddClick}
              className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              <Plus size={12} />
              <span>Add your first service area</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerServiceAreas;

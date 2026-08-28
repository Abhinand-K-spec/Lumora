import { Camera, Workflow, Shield } from "lucide-react";

interface GearItem {
  id: string;
  name: string;
  category: string; // e.g. "Body", "Stabilizer", "Drone"
  description: string;
  iconName: "camera" | "stabilizer" | "drone";
}

interface PhotographerGearProps {
  gearList?: GearItem[];
}

const PhotographerGear = ({
  gearList = [
    {
      id: "g1",
      name: "Sony A7R V",
      category: "Camera Body",
      description: "Primary high-res body for 61MP stills and 8K video.",
      iconName: "camera",
    },
    {
      id: "g2",
      name: "Ronin RS3 Pro",
      category: "Stabilizer",
      description: "Stabilization system for smooth cinematic tracking shots.",
      iconName: "stabilizer",
    },
    {
      id: "g3",
      name: "DJI Mavic 3 Cine",
      category: "Aerial Drone",
      description: "Aerial cinematography with ProRes 422 HQ recording.",
      iconName: "drone",
    },
  ],
}: PhotographerGearProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6.5 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-lg font-semibold text-text tracking-wide flex items-center gap-2">
          <Camera size={16} className="text-primary/75" /> Equipment & Gear
        </h3>
        <span className="text-[8px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          Professional
        </span>
      </div>

      {/* Gear Grid */}
      {gearList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gearList.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-neutral-900/40 border border-border/10 p-5 rounded-xl flex flex-col items-start hover:border-border/30 transition-all group"
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-border/10 flex items-center justify-center text-primary mb-4 transition-colors group-hover:bg-primary/5">
                  {item.iconName === "camera" && <Camera size={18} />}
                  {item.iconName === "stabilizer" && <Workflow size={18} />}
                  {item.iconName === "drone" && <Shield size={18} />}
                </div>

                {/* Title & Description */}
                <h4 className="font-heading text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-neutral-900/20 border border-dashed border-border/20 rounded-xl text-center">
          <Camera size={32} className="text-neutral-600 mb-3 stroke-[1.2]" />
          <p className="text-xs font-semibold text-text">No equipment listed yet</p>
          <p className="text-[10px] text-text-secondary mt-1 max-w-[280px]">
            Click the "Edit Profile" button above to add your cameras, stabilizers, lenses, or drones.
          </p>
        </div>
      )}

    </div>
  );
};

export default PhotographerGear;

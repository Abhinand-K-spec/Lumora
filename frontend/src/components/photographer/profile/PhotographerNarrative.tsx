interface PhotographerNarrativeProps {
  visionStatement: string;
  basedIn: string;
  languages: string[];
  serviceRegions?: string[];
}

const PhotographerNarrative = ({
  visionStatement,
  basedIn,
  languages = [],
  serviceRegions = [],
}: PhotographerNarrativeProps) => {
  const displayVision = visionStatement || "No narrative biography added yet. Click 'Edit Profile' to write a bio and share your professional vision!";
  const displayLocation = basedIn || "Not set (Click 'Edit Profile' to add)";
  const displayLanguages = (languages && languages.length > 0) ? languages.join(", ") : "Not set (Click 'Edit Profile' to add)";
  const displayRegions = (serviceRegions && serviceRegions.length > 0) ? serviceRegions.join(", ") : "Not set (Click 'Edit Profile' to add)";

  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6.5 select-none">
      
      {/* Title */}
      <h3 className="font-heading text-xl font-semibold text-text tracking-wide mb-4">
        Narrative Vision
      </h3>

      {/* Narrative Bio Content */}
      <p className="text-text-secondary text-sm leading-relaxed font-normal">
        {displayVision}
      </p>

      {/* Divider */}
      <div className="my-6 border-t border-border/10" />

      {/* Meta grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Base Studio */}
        <div>
          <span className="block text-[9px] uppercase tracking-widest text-text-secondary font-bold">
            Based In
          </span>
          <span className="block text-xs font-semibold text-text mt-1">
            {displayLocation}
          </span>
        </div>

        {/* Service Areas */}
        <div>
          <span className="block text-[9px] uppercase tracking-widest text-text-secondary font-bold">
            Service Areas
          </span>
          <span className="block text-xs font-semibold text-text mt-1 truncate" title={displayRegions}>
            {displayRegions}
          </span>
        </div>

        {/* Languages */}
        <div>
          <span className="block text-[9px] uppercase tracking-widest text-text-secondary font-bold">
            Languages
          </span>
          <span className="block text-xs font-semibold text-text mt-1 truncate" title={displayLanguages}>
            {displayLanguages}
          </span>
        </div>

      </div>

    </div>
  );
};

export default PhotographerNarrative;

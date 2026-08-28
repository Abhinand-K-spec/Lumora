import { Camera, Edit3, Loader2, Star, User } from "lucide-react";

interface PhotographerHeroProps {
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  specialities: string[];
  rating: number;
  reviewsCount: number;
  onEdit: () => void;
  onUploadPhotoClick: () => void;
  isUploading?: boolean;
}

const PhotographerHero = ({
  name = "Arjun Nair",
  avatarUrl,
  coverUrl = "https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?auto=format&fit=crop&q=80&w=1600",
  specialities = ["PHOTOGRAPHER", "CINEMATOGRAPHER"],
  rating = 4.9,
  reviewsCount = 124,
  onEdit,
  onUploadPhotoClick,
  isUploading = false,
}: PhotographerHeroProps) => {
  return (
    <div className="relative w-full select-none">
      
      {/* 1. Cover Photo Banner */}
      <div className="h-64 w-full bg-neutral-900 overflow-hidden relative">
        <img
          src={coverUrl}
          alt="Photographer Cover"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* 2. Overlapping Profile Metadata Container */}
      <div className="max-w-7xl mx-auto px-8 -mt-16 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6">
        
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          
          {/* Avatar Picture */}
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-surface border-4 border-black shadow-2xl group flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  isUploading ? "opacity-30" : ""
                }`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600 transition-opacity duration-200 ${
                isUploading ? "opacity-30" : ""
              }`}>
                <User size={48} className="stroke-[1.5]" />
              </div>
            )}
            
            {/* Upload Click overlay / Loader */}
            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] text-primary">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-[10px] mt-1.5 font-medium tracking-wide uppercase">Uploading...</span>
              </div>
            ) : (
              <div 
                onClick={onUploadPhotoClick}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-primary"
              >
                <Camera size={20} />
                <span className="text-[10px] mt-1 font-medium tracking-wide uppercase">Change Photo</span>
              </div>
            )}
          </div>

          {/* Profile Name & Badges */}
          <div className="mb-2">
            <h1 className="font-heading text-4xl font-semibold text-text tracking-wide">
              {name}
            </h1>
            
            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              
              {/* Speciality Badges */}
              {specialities.length > 0 ? (
                specialities.map((spec, i) => {
                  const isGold = i === 0 || spec.toUpperCase() === "PHOTOGRAPHER";
                  return (
                    <span
                      key={spec}
                      className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border ${
                        isGold
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-neutral-900 text-text-secondary border-border/30"
                      }`}
                    >
                      {spec}
                    </span>
                  );
                })
              ) : (
                <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-dashed border-border/30 bg-neutral-900/40 text-text-secondary">
                  No specialties added yet
                </span>
              )}

              {/* Reviews Summary */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary ml-1 bg-neutral-900/60 border border-border/10 px-2 py-0.5 rounded">
                <Star size={12} className="fill-primary text-primary" />
                <span>{rating} ({reviewsCount} Reviews)</span>
              </div>

            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-primary text-black font-semibold text-xs rounded-full hover:bg-secondary active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/15"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        </div>

      </div>

    </div>
  );
};

export default PhotographerHero;

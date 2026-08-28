interface NarrativeImage {
  id: string;
  url: string;
  alt: string;
}

interface PhotographerRecentProps {
  images?: NarrativeImage[];
  onViewPortfolioClick?: () => void;
}

const PhotographerRecent = ({
  images = [
    {
      id: "rn1",
      url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      alt: "Traditional Indian Bride",
    },
    {
      id: "rn2",
      url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
      alt: "Sunset Silhouette Beach",
    },
    {
      id: "rn3",
      url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=600",
      alt: "Traditional Attire Pillars",
    },
    {
      id: "rn4",
      url: "https://images.unsplash.com/photo-1540979388789-6cee28a1697b?auto=format&fit=crop&q=80&w=600",
      alt: "Aerial Backwaters Boat",
    },
  ],
  onViewPortfolioClick,
}: PhotographerRecentProps) => {
  return (
    <div className="select-none">
      
      {/* Title + Link */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-text tracking-wide">
          Recent Narratives
        </h3>
        <button
          onClick={onViewPortfolioClick}
          className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer font-semibold"
        >
          View Full Portfolio →
        </button>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => {
          return (
            <div
              key={img.id}
              className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 border border-border/10 hover:border-border/40 transition duration-300 relative group shadow-md"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              {/* Subtle hover shadow mask */}
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-0 transition-opacity" />
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default PhotographerRecent;

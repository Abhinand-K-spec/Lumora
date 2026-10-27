import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  MapPin,
  ArrowRight,
  Trash2,
  Search,
  Camera,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import userService from "../../services/userService";
import type { PhotographerProfile } from "../../services/photographerService";
import { getErrorMessage } from "../../utils/errorUtils";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
];

const Saved = () => {
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSavedPhotographers = async () => {
    try {
      setLoading(true);
      const res = await userService.getSavedPhotographers();
      if (res.data?.photographers) {
        setPhotographers(res.data.photographers);
      } else {
        setPhotographers([]);
      }
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Failed to load saved photographers."),
      );
      setPhotographers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPhotographers();
  }, []);

  const handleRemove = async (photographerId: string, name: string) => {
    if (removingId === photographerId) return;
    setRemovingId(photographerId);

    // Optimistically remove from list
    const previousList = photographers;
    setPhotographers((prev) => prev.filter((p) => p.id !== photographerId));

    try {
      await userService.toggleSavePhotographer(photographerId);
      toast.info(`Removed ${name} from saved.`);
    } catch (err: unknown) {
      // Revert if API fails
      setPhotographers(previousList);
      toast.error(
        getErrorMessage(err, "Failed to remove photographer from saved."),
      );
    } finally {
      setRemovingId(null);
    }
  };

  const filteredPhotographers = photographers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.location?.toLowerCase().includes(query) ||
      p.specialities?.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-[80vh] flex flex-col font-body py-4 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F2C94C] animate-pulse" />
            <span className="text-[11px] font-bold text-[#F2C94C] uppercase tracking-widest">
              My Collections
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-white tracking-wide">
            Saved Photographers
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-light">
            Keep track of your favorite artists, compare portfolio aesthetics,
            and quickly request bookings for your milestones.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/photographers")}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Camera size={14} className="text-[#F2C94C]" />
            <span>Discover Photographers</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {!loading && photographers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, city, or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1012] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#F2C94C]/60 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-medium text-[11px]">
              {filteredPhotographers.length}{" "}
              {filteredPhotographers.length === 1 ? "artist" : "artists"} saved
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="mt-8 flex-1">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 text-[#F2C94C] animate-spin" />
            <span className="text-xs tracking-wider uppercase font-semibold">
              Loading your saved artists...
            </span>
          </div>
        ) : photographers.length === 0 ? (
          /* Empty State: No saved photographers at all */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#F2C94C]/10 border border-[#F2C94C]/25 flex items-center justify-center text-[#F2C94C] shadow-2xl shadow-[#F2C94C]/15 mb-6">
              <Bookmark size={34} className="stroke-[1.5]" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-white tracking-wide">
              No Saved Photographers
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You haven't saved any photographers yet. Browse our curated roster
              of wedding, portrait, and fashion photographers across Kerala to
              build your collection.
            </p>
            <button
              onClick={() => navigate("/photographers")}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#F2C94C] to-[#dfb230] text-black text-xs font-semibold rounded-full hover:brightness-110 active:scale-98 transition shadow-lg shadow-[#F2C94C]/20 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Sparkles size={14} />
              <span>Explore Photographers</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : filteredPhotographers.length === 0 ? (
          /* Empty Search Results */
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">
              No saved photographers matched "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-[#F2C94C] hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          /* Grid of Saved Photographers */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotographers.map((p, idx) => {
              const coverUrl =
                p.coverPhoto || FALLBACK_COVERS[idx % FALLBACK_COVERS.length];

              return (
                <div
                  key={p.id}
                  className="bg-[#0f1012] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#F2C94C]/40 shadow-xl hover:shadow-2xl hover:shadow-[#F2C94C]/5 transition duration-300 group"
                >
                  {/* Top: Cover photo & quick actions */}
                  <div
                    onClick={() => navigate(`/photographers/${p.id}`)}
                    className="h-44 relative overflow-hidden bg-neutral-950 cursor-pointer"
                  >
                    <img
                      src={coverUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1012] via-black/40 to-transparent" />

                    {/* Quick remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(p.id, p.name);
                      }}
                      disabled={removingId === p.id}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-950/80 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-gray-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer backdrop-blur-md"
                      title="Remove from saved"
                    >
                      {removingId === p.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>

                    {/* Avatar & Name Overlay */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 border-2 border-[#F2C94C] shadow-lg flex-shrink-0 flex items-center justify-center">
                        {p.profilePhoto ? (
                          <img
                            src={p.profilePhoto}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-heading font-bold text-sm text-[#F2C94C]">
                            {p.name?.charAt(0) || "P"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-semibold text-white tracking-wide group-hover:text-[#F2C94C] transition-colors leading-tight">
                          {p.name}
                        </h3>
                        {p.location && (
                          <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                            <MapPin size={10} className="text-[#F2C94C]" />
                            <span>{p.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Specialities tags */}
                      {p.specialities && p.specialities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {p.specialities.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F2C94C]/10 border border-[#F2C94C]/20 text-[#F2C94C]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio snippet */}
                      <p className="text-xs text-gray-400 line-clamp-2 font-light leading-relaxed">
                        {p.bio ||
                          "Specialized visual storyteller capturing genuine moments and authentic narratives."}
                      </p>
                    </div>

                    {/* Bottom row: pricing & view profile */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                          Starting At
                        </span>
                        <span className="text-xs font-bold text-[#F2C94C]">
                          {p.startingPrice
                            ? `₹${p.startingPrice.toLocaleString("en-IN")}`
                            : "On Request"}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/photographers/${p.id}`)}
                        className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#F2C94C] text-gray-300 hover:text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer group/btn"
                      >
                        <span>View Profile</span>
                        <ExternalLink
                          size={11}
                          className="group-hover/btn:translate-x-0.5 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;

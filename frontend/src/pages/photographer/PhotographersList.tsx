import { useState, useEffect } from "react";
import { Search, MapPin, Star, ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import photographerService, { type PhotographerProfile } from "../../services/photographerService";
import { toast } from "sonner";
import { DISTRICTS as BASE_DISTRICTS, SERVICES as BASE_SERVICES } from "../../constants/profileOptions";

const DISTRICTS = [
  "All Districts",
  ...BASE_DISTRICTS
];

const SERVICES = [
  "All Services",
  ...BASE_SERVICES
];

const PRICE_TIERS = [
  { label: "All Pricing", value: "" },
  { label: "₹ (Budget)", value: "₹" },
  { label: "₹₹ (Standard)", value: "₹₹" },
  { label: "₹₹₹ (Premium)", value: "₹₹₹" },
  { label: "₹₹₹₹ (Elite)", value: "₹₹₹₹" }
];

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80"
];

const FALLBACK_THUMBNAILS = [
  [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=150&auto=format&fit=crop&q=60"
  ],
  [
    "https://images.unsplash.com/photo-1519225495810-7517c2965a7d?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1520854221256-17451cc35953?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=150&auto=format&fit=crop&q=60"
  ],
  [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150&auto=format&fit=crop&q=60"
  ]
];

const PhotographersList = () => {
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [service, setService] = useState("");
  const [price, setPrice] = useState("");

  // Visual filter state applied on backend search
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    district: "",
    service: "",
    price: ""
  });

  // Sorting & Toggles
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch photographers on filters update
  useEffect(() => {
    const loadPhotographers = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (activeFilters.search) params.search = activeFilters.search;
        if (activeFilters.district) params.district = activeFilters.district;
        if (activeFilters.service) params.service = activeFilters.service;
        if (activeFilters.price) params.price = activeFilters.price;

        const res = await photographerService.getPhotographers(params);
        if (res.data && res.data.photographers) {
          setPhotographers(res.data.photographers);
        }
      } catch {
        toast.error("Failed to load photographers list");
      } finally {
        setLoading(false);
      }
    };
    loadPhotographers();
  }, [activeFilters]);

  // Apply filters trigger
  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveFilters({
      search,
      district,
      service,
      price
    });
    setCurrentPage(1);
  };

  // Sorting & Toggling logic
  const handleTopRatedToggle = () => {
    setTopRatedOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // Derived filtered & sorted list
  const displayPhotographers = [...photographers];

  // Sorting logic
  if (sortBy === "Price: Low to High") {
    displayPhotographers.sort((a, b) => {
      const priceA = a.packages && a.packages.length > 0 ? Math.min(...a.packages.map((p) => p.price)) : 25000;
      const priceB = b.packages && b.packages.length > 0 ? Math.min(...b.packages.map((p) => p.price)) : 25000;
      return priceA - priceB;
    });
  } else if (sortBy === "Price: High to Low") {
    displayPhotographers.sort((a, b) => {
      const priceA = a.packages && a.packages.length > 0 ? Math.min(...a.packages.map((p) => p.price)) : 25000;
      const priceB = b.packages && b.packages.length > 0 ? Math.min(...b.packages.map((p) => p.price)) : 25000;
      return priceB - priceA;
    });
  }

  // Pagination bounds
  const totalItems = displayPhotographers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPhotographers = displayPhotographers.slice(startIndex, startIndex + itemsPerPage);

  const getStartsAtPrice = (profile: PhotographerProfile) => {
    if (profile.packages && profile.packages.length > 0) {
      const active = profile.packages.filter((p) => p.status === "active");
      if (active.length > 0) {
        const prices = active.map((p) => p.price);
        return Math.min(...prices);
      }
    }
    return 25000; // Fallback starts-at price
  };

  const handleBookClick = (name: string) => {
    toast.success(`Redirecting to booking portal for ${name}!`);
  };

  return (
    <div className="min-h-screen text-text select-none pb-12 flex flex-col justify-between">
      <div>
        {/* Header Hero Title Section */}
        <div className="text-center py-10 md:py-16 max-w-3xl mx-auto space-y-4">
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text leading-tight tracking-wide bg-gradient-to-r from-text via-text/90 to-primary/80 bg-clip-text text-transparent">
            Capturing Kerala's Grandeur
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-xl mx-auto font-body">
            Discover elite photographers for destination weddings, traditional ceremonies , and editorial shoots.
          </p>
        </div>

        {/* Search & Filters Container */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-[#0f1012] border border-border/20 p-4 rounded-xl max-w-5xl mx-auto mb-6 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-end font-body"
        >
          {/* Search Input */}
          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[9px] text-primary font-bold uppercase tracking-widest">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={12} />
              <input
                type="text"
                placeholder="Name, style, or ceremony..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950/80 border border-border/20 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-text outline-none focus:border-primary/50 transition h-9"
              />
            </div>
          </div>

          {/* District Select */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[9px] text-primary font-bold uppercase tracking-widest">
              District
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full appearance-none bg-neutral-950/80 border border-border/20 rounded-lg pl-3 pr-8 py-1.5 text-[11px] text-text outline-none focus:border-primary/50 transition cursor-pointer h-9"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d === "All Districts" ? "" : d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={12} />
            </div>
          </div>

          {/* Service Select */}
          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[9px] text-primary font-bold uppercase tracking-widest">
              Service
            </label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none bg-neutral-950/80 border border-border/20 rounded-lg pl-3 pr-8 py-1.5 text-[11px] text-text outline-none focus:border-primary/50 transition cursor-pointer h-9"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s === "All Services" ? "" : s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={12} />
            </div>
          </div>

          {/* Pricing Select */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[9px] text-primary font-bold uppercase tracking-widest">
              Pricing
            </label>
            <div className="relative">
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full appearance-none bg-neutral-950/80 border border-border/20 rounded-lg pl-3 pr-8 py-1.5 text-[11px] text-text outline-none focus:border-primary/50 transition cursor-pointer h-9"
              >
                {PRICE_TIERS.map((tier) => (
                  <option key={tier.label} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={12} />
            </div>
          </div>

          {/* Action Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#F2C94C] hover:bg-[#F2C94C]/95 text-neutral-950 font-bold uppercase tracking-wider text-[9px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98 h-9"
            >
              <span>Filter Results</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </form>

        {/* Quick Toggles & Sorting Row */}
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {/* Total Count Badge */}
            <span className="text-[10px] font-bold text-text-secondary bg-[#0f1012] border border-border/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {totalItems} {totalItems === 1 ? "Photographer" : "Photographers"} in Kerala
            </span>

            {/* Top Rated Toggle Chip */}
            <button
              type="button"
              onClick={handleTopRatedToggle}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border transition cursor-pointer ${topRatedOnly
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-[#0f1012] border-border/10 text-text-secondary hover:text-text hover:border-border/30"
                }`}
            >
              Top Rated
            </button>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-text-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-text font-semibold outline-none cursor-pointer hover:text-primary transition text-xs"
            >
              <option value="Recommended" className="bg-[#0f1012]">Recommended</option>
              <option value="Price: Low to High" className="bg-[#0f1012]">Price: Low to High</option>
              <option value="Price: High to Low" className="bg-[#0f1012]">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Photographers Grid */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="py-20 text-center text-text-secondary text-sm">
              Loading photographers list...
            </div>
          ) : paginatedPhotographers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPhotographers.map((p, idx) => {
                const coverUrl = p.coverPhoto || FALLBACK_COVERS[idx % FALLBACK_COVERS.length];
                const thumbs = FALLBACK_THUMBNAILS[idx % FALLBACK_THUMBNAILS.length];
                const rating = (4.8 + (idx % 3) * 0.1).toFixed(1);
                const reviewCount = 98 + (idx * 17) % 150;

                return (
                  <div
                    key={p.id}
                    className="bg-[#0f1012]/60 border border-border/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-border/35 shadow-xl hover:shadow-2xl transition duration-300 group"
                  >
                    {/* Top Section: Cover & Overlay */}
                    <div 
                      onClick={() => navigate(`/photographers/${p.id}`)}
                      className="h-40 relative overflow-hidden bg-neutral-950 cursor-pointer"
                    >
                      <img
                        src={coverUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {/* Gradient Shadow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      {/* Rating Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-neutral-950/85 backdrop-blur-md border border-border/15 px-1.5 py-0.5 rounded flex items-center gap-1 text-[8px] font-bold text-text-secondary">
                        <Star size={8} className="text-primary fill-primary" />
                        <span>
                          {rating} ({reviewCount})
                        </span>
                      </div>

                      {/* Avatar Overlay & Details */}
                      <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                        {p.profilePhoto ? (
                          <img
                            src={p.profilePhoto}
                            alt={p.name}
                            className="w-8 h-8 rounded-full object-cover border border-white"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-white flex items-center justify-center font-bold text-[10px] text-primary">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-[11px] font-semibold text-white tracking-wide leading-tight group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-[8.5px] text-text-secondary mt-0.5">
                            <MapPin size={8.5} className="text-primary" />
                            <span>{p.location || "Kerala"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Thumbnails Portfolios */}
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-1.5">
                        {thumbs.map((thumb, index) => (
                          <div key={index} className="h-11 rounded overflow-hidden bg-neutral-950">
                            <img
                              src={thumb}
                              alt="Portfolio Thumbnail"
                              className="w-full h-full object-cover hover:scale-110 transition duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Section: Starts At & Book Action */}
                    <div className="px-3 pb-3 pt-2 border-t border-border/5 flex items-center justify-between">
                      <div>
                        <span className="block text-[7.5px] text-text-secondary font-bold uppercase tracking-wider">
                          Starts At
                        </span>
                        <span className="text-[11px] font-bold text-primary">
                          ₹{getStartsAtPrice(p).toLocaleString("en-IN")}/day
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookClick(p.name)}
                        className="bg-primary hover:bg-primary/90 text-neutral-950 font-bold uppercase tracking-wider text-[8.5px] px-3 py-1 rounded-md transition cursor-pointer active:scale-98"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-text-secondary text-sm bg-neutral-900/10 border border-border/10 rounded-2xl">
              No photographers found matching the filters.
            </div>
          )}
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 mt-10">
            {/* Prev Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border/10 hover:border-border/30 rounded-xl text-text-secondary disabled:opacity-40 disabled:pointer-events-none hover:text-text cursor-pointer transition"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page Index Numbers */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pIdx = index + 1;
              return (
                <button
                  key={pIdx}
                  onClick={() => setCurrentPage(pIdx)}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer ${currentPage === pIdx
                    ? "bg-primary text-neutral-950"
                    : "text-text-secondary hover:text-text hover:bg-neutral-900/60"
                    }`}
                >
                  {pIdx}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-border/10 hover:border-border/30 rounded-xl text-text-secondary disabled:opacity-40 disabled:pointer-events-none hover:text-text cursor-pointer transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* footer section */}
      <footer className="max-w-5xl w-full mx-auto mt-20 pt-8 border-t border-border/15 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="font-heading text-lg font-bold text-primary tracking-wider uppercase">
            Lumora
          </span>
          <p className="text-[10px] text-text-secondary">
            © {new Date().getFullYear()} Lumora Kerala. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[10px] text-text-secondary">
          <a href="#" className="hover:text-text transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-text transition-colors">Contact Us</a>
          <a href="#" className="hover:text-text transition-colors">Press Kit</a>
        </div>

        <div className="flex items-center gap-4 text-text-secondary">
          <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PhotographersList;

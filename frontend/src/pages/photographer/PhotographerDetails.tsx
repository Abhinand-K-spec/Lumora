import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Star, Camera, Clock, Check, Sparkles, X, 
  Map, Send, ArrowRight, Shield
} from "lucide-react";
import { toast } from "sonner";
import photographerService, { type PhotographerProfile, type PackageItem } from "../../services/photographerService";

// Curated default photographer details in case DB profile lacks information
const MOCK_PROFILE = {
  name: "Arjun Nair Photography",
  bio: "Architect of Cinematic Memories. Specializing in high-end wedding documentation and editorial portraits across the Indian Subcontinent.",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?w=1600&auto=format&fit=crop&q=80",
  location: "Kochi, Kerala",
  specialities: ["Premium Studio", "Elite Member"],
  experienceYears: 12,
  rating: 4.9,
  reviewsCount: 124,
  totalBookings: 250,
  awardsCount: 15,
  cinematicPhilosophy: "At Lumora Studio, we believe photography is more than just capturing images; it's about preserving the rhythm of a heartbeat. Our signature \"Golden Hour\" style blends traditional warmth with modern editorial precision. We don't just attend your events—we curate your legacy through frames that feel like stills from a classic film.",
  equipmentSummary: "Dual Sony Alpha a7R V, Zeiss Optics",
  deliverySummary: "30-45 Day Turnaround Guaranteed",
  serviceRegions: ["Pan-India", "Kochi"],
  packages: [
    {
      packageName: "Essential",
      subName: "Heritage",
      price: 75000,
      features: [
        "1 Lead Photographer",
        "8 Hours Coverage",
        "200+ Color Graded Frames",
        "Online Gallery Delivery"
      ],
      icon: "flower",
      buttonText: "Select Plan"
    },
    {
      packageName: "Signature Choice",
      subName: "Elite Royale",
      price: 150000,
      features: [
        "2 Lead Photographers",
        "Cinematic Wedding Film",
        "4K Drone Coverage",
        "Premium Linen Album",
        "Full Event Coverage"
      ],
      icon: "crown",
      popular: true,
      buttonText: "Book Signature Package"
    },
    {
      packageName: "The Ultimate",
      subName: "Infinity",
      price: 275000,
      features: [
        "Multi-Day Full Team",
        "International Travel Incl.",
        "Live Streaming Service",
        "Same Day Edits"
      ],
      icon: "diamond",
      buttonText: "Inquire Now"
    }
  ],
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80",
      category: "wedding",
      caption: "Boat ride at Vembanad Lake"
    },
    {
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
      category: "wedding",
      caption: "Henna ritual details"
    },
    {
      url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
      category: "bts",
      caption: "Behind the lens with the heavy rig"
    },
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      category: "editorial",
      caption: "Touching blessing ceremony"
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
      category: "wedding",
      caption: "Traditional Kerala ceremony"
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      category: "editorial",
      caption: "Stunning landscape portrait"
    }
  ]
};

const PhotographerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Profile state populated from API and falling back to curate mockup details
  const [profile, setProfile] = useState<typeof MOCK_PROFILE & { original?: PhotographerProfile } | null>(null);
  
  // Page Interactivity states
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "packages" | "reviews" | "policies">("overview");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "wedding" | "bts" | "editorial">("all");
  
  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    date: "",
    eventType: "Wedding",
    notes: ""
  });

  // Quotation Form State
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    location: "",
    expectedGuests: "100-300",
    servicesRequired: [] as string[]
  });

  useEffect(() => {
    const fetchPhotographer = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await photographerService.getPhotographerById(id);
        if (res.data && res.data.photographer) {
          const pg = res.data.photographer;
          
          // Map DB packages if any, else use the customized mock ones
          let dbPackages = MOCK_PROFILE.packages;
          if (pg.packages && pg.packages.length > 0) {
            dbPackages = pg.packages.map((pkg: PackageItem, index: number) => {
              const icons = ["flower", "crown", "diamond"];
              const subNames = ["Heritage", "Elite Royale", "Infinity"];
              return {
                packageName: pkg.packageName,
                subName: subNames[index % subNames.length],
                price: pkg.price,
                features: pkg.description.split(",").map(f => f.trim()).filter(Boolean),
                icon: icons[index % icons.length],
                popular: index === 1,
                buttonText: index === 1 ? "Book Signature Package" : (index === 0 ? "Select Plan" : "Inquire Now")
              };
            });
          }

          setProfile({
            name: pg.name || MOCK_PROFILE.name,
            bio: pg.bio || MOCK_PROFILE.bio,
            profilePhoto: pg.profilePhoto || MOCK_PROFILE.profilePhoto,
            coverPhoto: pg.coverPhoto || MOCK_PROFILE.coverPhoto,
            location: pg.location || MOCK_PROFILE.location,
            specialities: pg.specialities && pg.specialities.length > 0 ? pg.specialities : MOCK_PROFILE.specialities,
            experienceYears: pg.experienceYears || MOCK_PROFILE.experienceYears,
            rating: pg.rating || MOCK_PROFILE.rating,
            reviewsCount: pg.reviewsCount || MOCK_PROFILE.reviewsCount,
            totalBookings: pg.totalBookings || MOCK_PROFILE.totalBookings,
            awardsCount: MOCK_PROFILE.awardsCount,
            cinematicPhilosophy: pg.bio || MOCK_PROFILE.cinematicPhilosophy,
            equipmentSummary: pg.equipment && pg.equipment.length > 0 ? pg.equipment.join(", ") : MOCK_PROFILE.equipmentSummary,
            deliverySummary: MOCK_PROFILE.deliverySummary,
            serviceRegions: pg.serviceRegions && pg.serviceRegions.length > 0 ? pg.serviceRegions : MOCK_PROFILE.serviceRegions,
            packages: dbPackages,
            gallery: MOCK_PROFILE.gallery, // Gallery falls back to our beautiful curated photoshoot list
            original: pg
          });
        }
      } catch (err) {
        console.error("Using fallback curated profile details for sandbox.", err);
        // Fallback for sandboxed profiles or errors
        setProfile(MOCK_PROFILE);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographer();
  }, [id]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email || !bookingForm.date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success(`Booking request submitted successfully for ${bookingForm.eventType}! Arjun Nair's team will contact you shortly.`);
    setIsBookingModalOpen(false);
    setBookingForm({ name: "", email: "", date: "", eventType: "Wedding", notes: "" });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) {
      toast.error("Please fill in the required contact information.");
      return;
    }
    toast.success("Quotation request submitted! We will send a detailed price breakdown to your email.");
    setIsQuoteModalOpen(false);
    setQuoteForm({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      location: "",
      expectedGuests: "100-300",
      servicesRequired: []
    });
  };

  const openBookingForPlan = (packageName: string) => {
    setSelectedPlan(packageName);
    setBookingForm(prev => ({ ...prev, notes: `Interested in the ${packageName} collection.` }));
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-text-secondary text-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading artist profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-text-secondary p-6">
        <p className="text-lg">Artist profile not found.</p>
        <button onClick={() => navigate("/photographers")} className="mt-4 text-primary font-bold hover:underline flex items-center gap-1">
          Back to list <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // Filter gallery items based on active chip
  const filteredGallery = profile.gallery.filter(item => 
    galleryFilter === "all" ? true : item.category === galleryFilter
  );

  return (
    <div className="min-h-screen bg-[#070708] text-[#F3F4F6] flex flex-col justify-between font-body select-none">
      
      {/* 1. Artist Cover & Main Details */}
      <div className="w-full relative">
        {/* Cover Photo */}
        <div className="h-72 w-full bg-neutral-950 overflow-hidden relative">
          <img 
            src={profile.coverPhoto} 
            alt={profile.name} 
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/40 to-transparent" />
        </div>

        {/* Profile Card Overlay Container */}
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {/* Round Avatar with Gold Ring border */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden bg-neutral-900 border-4 border-primary/45 shadow-2xl flex-shrink-0">
              <img 
                src={profile.profilePhoto} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="mb-2 space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {profile.specialities.map((badge) => (
                  <span 
                    key={badge} 
                    className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#f2c94c]/10 border border-[#f2c94c]/20 text-[#f2c94c]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-wide text-white">
                {profile.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-400 font-light max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button 
              onClick={() => openBookingForPlan("Signature Choice")}
              className="px-6 py-2.5 bg-gradient-to-r from-[#F2C94C] to-[#dfb230] text-black font-semibold text-xs rounded-full hover:brightness-110 active:scale-98 transition shadow-lg shadow-[#F2C94C]/15 cursor-pointer uppercase tracking-wider text-center"
            >
              Book Now
            </button>
            <button 
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-6 py-2.5 bg-transparent border border-white/20 text-white hover:text-black hover:bg-white font-semibold text-xs rounded-full active:scale-98 transition cursor-pointer uppercase tracking-wider text-center"
            >
              Request Quotation
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Counter Row */}
      <div className="max-w-7xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: `${profile.experienceYears}+`, label: "Years Experience" },
            { value: `${profile.rating}★`, label: "Avg. Rating" },
            { value: `${profile.totalBookings}+`, label: "Events Captured" },
            { value: `${profile.awardsCount}+`, label: "Industry Awards" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-[#0f1012] border border-white/5 rounded-xl p-5 text-center hover:border-white/10 transition-colors shadow-lg"
            >
              <div className="text-xl md:text-2xl font-bold text-[#F2C94C] tracking-tight">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Section Tabs Bar */}
      <div className="border-b border-white/5 w-full bg-[#08080a] sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
          {(["overview", "portfolio", "packages", "reviews", "policies"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab 
                  ? "border-[#F2C94C] text-[#F2C94C]" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Views Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* Left Narrative details */}
            <div className="space-y-6">
              <div className="bg-[#0f1012]/50 border border-white/5 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
                  The Cinematic Philosophy
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  {profile.cinematicPhilosophy}
                </p>
              </div>

              {/* Equipment & Delivery Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0f1012] border border-white/5 p-5 rounded-xl flex items-start gap-4">
                  <div className="p-2.5 bg-white/5 rounded-lg text-[#F2C94C] flex-shrink-0">
                    <Camera size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Equipment</h4>
                    <p className="text-xs text-gray-300 mt-1 font-light leading-relaxed">{profile.equipmentSummary}</p>
                  </div>
                </div>

                <div className="bg-[#0f1012] border border-white/5 p-5 rounded-xl flex items-start gap-4">
                  <div className="p-2.5 bg-white/5 rounded-lg text-[#F2C94C] flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Delivery</h4>
                    <p className="text-xs text-gray-300 mt-1 font-light leading-relaxed">{profile.deliverySummary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Map/Region details */}
            <div className="bg-[#0f1012]/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between h-[230px] p-5 relative group">
              {/* Map Outline Abstract Visual representation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-700">
                <Map size={180} className="stroke-[1]" />
              </div>
              
              <div className="z-10 flex items-center justify-center h-full">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#F2C94C] animate-pulse">
                  <MapPin size={24} />
                </div>
              </div>

              <div className="z-10 bg-[#070708]/90 border border-white/5 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-300 font-medium">
                  Serving {profile.serviceRegions.join(", ")}, based in {profile.location}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
              Portfolio & Creative Work
            </h3>
            <p className="text-sm text-gray-400 font-light">
              Explore selective frames capturing visual stories, client celebrations, and editorial portraits.
            </p>
          </div>
        )}

        {/* TAB 3: PACKAGES */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
              Pricing Packages & Tiers
            </h3>
            <p className="text-sm text-gray-400 font-light">
              Choose a design package below or request a custom quotation tailored for your specific celebration needs.
            </p>
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="text-3xl font-bold text-[#F2C94C]">{profile.rating}</div>
              <div>
                <div className="flex gap-0.5 text-[#F2C94C]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current animate-pulse" />)}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Based on {profile.reviewsCount} reviews</div>
              </div>
            </div>
            {/* Custom Review lists */}
            <div className="space-y-4">
              {[
                { author: "Sneha & Rahul", date: "Jan 2026", rating: 5, comment: "Arjun and his team were absolutely incredible at our wedding in Kochi. The cinematic video brought tears to our eyes!" },
                { author: "Vikram K.", date: "Nov 2025", rating: 5, comment: "Professional, creative, and completely unobtrusive. The photos are absolute masterpieces." }
              ].map((rev, idx) => (
                <div key={idx} className="bg-[#0f1012] border border-white/5 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">{rev.author}</span>
                    <span className="text-[10px] text-gray-500">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 text-[#F2C94C]">
                    {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}
                  </div>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: POLICIES */}
        {activeTab === "policies" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Booking Confirmation", desc: "50% advance payment required to lock dates. Remaining balance due on the day of event." },
              { icon: Clock, title: "Delivery Timelines", desc: "Digital previews sent in 7 days. Final edit reels and luxury album shipped within 45 days." },
              { icon: X, title: "Cancellation Policy", desc: "Refund of booking advance is subject to cancellation timelines. Free rescheduling up to 90 days before event date." }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-[#0f1012] border border-white/5 p-5 rounded-xl space-y-3">
                  <div className="p-2 bg-white/5 rounded-lg text-[#F2C94C] w-9 h-9 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <h4 className="text-xs font-semibold text-white">{p.title}</h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Pricing Collections Cards (Always visible below overview/packages to match mockup hierarchy) */}
        {(activeTab === "overview" || activeTab === "packages") && (
          <div className="mt-16 space-y-8">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <h3 className="text-xl md:text-2xl font-semibold tracking-wide text-white">Exclusive Collections</h3>
              <p className="text-xs text-gray-400 font-light">
                Meticulously crafted tiers designed to encompass every nuance of your celebration.
              </p>
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {profile.packages.map((pkg, idx) => (
                <div 
                  key={idx} 
                  className={`bg-[#0f1012]/80 border rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative ${
                    pkg.popular 
                      ? "border-[#F2C94C]/60 shadow-[0_0_20px_rgba(242,201,76,0.15)] bg-gradient-to-b from-[#16171a] to-[#0f1012]" 
                      : "border-white/5 shadow-md"
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-6 bg-[#F2C94C] text-black font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          {pkg.packageName}
                        </h4>
                        <h5 className="text-sm font-semibold text-white tracking-wide mt-0.5">
                          {pkg.subName}
                        </h5>
                      </div>
                      
                      {/* Sub-Icon display matching mockup theme */}
                      <div className="text-[#F2C94C]">
                        <Sparkles size={16} />
                      </div>
                    </div>

                    {/* Features checklist */}
                    <ul className="space-y-2.5 pt-2">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs text-gray-400">
                          <Check size={12} className="text-[#F2C94C]" />
                          <span className="font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-8 space-y-4">
                    <div>
                      <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-bold">Starting at</span>
                      <span className="text-xl font-extrabold text-white">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button 
                      onClick={() => openBookingForPlan(pkg.packageName)}
                      className={`w-full py-2.5 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all active:scale-98 cursor-pointer text-center ${
                        pkg.popular 
                          ? "bg-[#F2C94C] hover:bg-[#F2C94C]/90 text-neutral-950 font-bold" 
                          : "bg-transparent border border-white/10 hover:border-white/20 text-gray-300"
                      }`}
                    >
                      {pkg.buttonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Gallery / Bottom Visual grid (Always visible below overview/portfolio to match mockup hierarchy) */}
        {(activeTab === "overview" || activeTab === "portfolio") && (
          <div className="mt-20 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-heading font-semibold text-white tracking-wide">Gallery & BTS</h3>
                <p className="text-xs text-gray-400 font-light">A window into our cinematic world.</p>
              </div>

              {/* Gallery Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {(["all", "wedding", "bts", "editorial"] as const).map(chip => (
                  <button
                    key={chip}
                    onClick={() => setGalleryFilter(chip)}
                    className={`text-[9px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                      galleryFilter === chip 
                        ? "bg-[#F2C94C] border-[#F2C94C] text-black" 
                        : "bg-transparent border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Masonry / Structured Image Grid matching the design layout */}
            {filteredGallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto">
                {/* Left Column: Tall image (5 columns wide) */}
                {filteredGallery[0] && (
                  <div className="md:col-span-5 h-[450px] rounded-2xl overflow-hidden relative group">
                    <img 
                      src={filteredGallery[0].url} 
                      alt={filteredGallery[0].caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                      <span className="text-xs text-white font-medium">{filteredGallery[0].caption}</span>
                    </div>
                  </div>
                )}

                {/* Right Column: Composite grid of 3 images (7 columns wide) */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {/* Top sub-row: Two columns side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[220px]">
                    {filteredGallery[1] && (
                      <div className="h-full rounded-2xl overflow-hidden relative group">
                        <img 
                          src={filteredGallery[1].url} 
                          alt={filteredGallery[1].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-[10px] text-white font-medium">{filteredGallery[1].caption}</span>
                        </div>
                      </div>
                    )}
                    {filteredGallery[2] && (
                      <div className="h-full rounded-2xl overflow-hidden relative group">
                        <img 
                          src={filteredGallery[2].url} 
                          alt={filteredGallery[2].caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-[10px] text-white font-medium">{filteredGallery[2].caption}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom wide image in right column */}
                  {filteredGallery[3] && (
                    <div className="h-[214px] rounded-2xl overflow-hidden relative group">
                      <img 
                        src={filteredGallery[3].url} 
                        alt={filteredGallery[3].caption} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] text-white font-medium">{filteredGallery[3].caption}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500 text-xs border border-white/5 border-dashed rounded-2xl">
                No items in this gallery filter category.
              </div>
            )}
          </div>
        )}

      </div>

      {/* 5. Interactive Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f1012] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="space-y-1.5">
              <h3 className="text-lg font-heading font-semibold text-white">Book {profile.name}</h3>
              {selectedPlan && (
                <div className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider font-semibold">
                  Selected package: {selectedPlan}
                </div>
              )}
              <p className="text-xs text-gray-400">Lock your date for event shoots and film capturing.</p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Your Name *</label>
                <input 
                  type="text" 
                  required
                  value={bookingForm.name}
                  onChange={e => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={bookingForm.email}
                  onChange={e => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none transition"
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Event Date *</label>
                  <input 
                    type="date" 
                    required
                    value={bookingForm.date}
                    onChange={e => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Event Type</label>
                  <select 
                    value={bookingForm.eventType}
                    onChange={e => setBookingForm(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none cursor-pointer transition"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selected Plan / Notes</label>
                <textarea 
                  value={bookingForm.notes}
                  onChange={e => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none transition resize-none"
                  placeholder="List any extra requirements or custom session timings..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#F2C94C] hover:bg-[#F2C94C]/95 text-black font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Confirm Booking Request</span>
                <Send size={10} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Request Quotation Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f1012] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="space-y-1.5">
              <h3 className="text-lg font-heading font-semibold text-white">Request Quotation</h3>
              <p className="text-xs text-gray-400">Request custom pricing based on event headcount and location details.</p>
            </div>
            
            <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Contact Name *</label>
                  <input 
                    type="text" 
                    required
                    value={quoteForm.name}
                    onChange={e => setQuoteForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={quoteForm.phone}
                    onChange={e => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={quoteForm.email}
                  onChange={e => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                  placeholder="name@gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Shoot Location</label>
                  <input 
                    type="text"
                    value={quoteForm.location}
                    onChange={e => setQuoteForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="e.g. Kochi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Event Scale (Guests)</label>
                  <select 
                    value={quoteForm.expectedGuests}
                    onChange={e => setQuoteForm(prev => ({ ...prev, expectedGuests: e.target.value }))}
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none cursor-pointer"
                  >
                    <option value="Under 100">Under 100</option>
                    <option value="100-300">100-300</option>
                    <option value="300-500">300-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Services Needed</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {["Photography", "Videography", "Drone Aerials", "Album Printing"].map(srv => {
                    const isChecked = quoteForm.servicesRequired.includes(srv);
                    return (
                      <button
                        type="button"
                        key={srv}
                        onClick={() => {
                          setQuoteForm(prev => ({
                            ...prev,
                            servicesRequired: isChecked 
                              ? prev.servicesRequired.filter(x => x !== srv)
                              : [...prev.servicesRequired, srv]
                          }));
                        }}
                        className={`py-1.5 px-3 rounded-lg text-left text-[10px] border transition flex items-center justify-between cursor-pointer ${
                          isChecked 
                            ? "bg-[#F2C94C]/10 border-[#F2C94C] text-[#F2C94C]" 
                            : "bg-[#070708] border-white/5 text-gray-400"
                        }`}
                      >
                        <span>{srv}</span>
                        {isChecked && <Check size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-2.5 bg-transparent border border-white/20 hover:bg-white hover:text-black text-white font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Request Custom Pricing</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Bottom Brand Footer */}
      <footer className="w-full border-t border-white/5 bg-[#050506] py-12 px-6 select-none mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 text-center">
          <div className="space-y-2">
            <span className="font-heading text-xl font-bold text-[#F2C94C] tracking-widest uppercase">
              LUMORA
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-gray-500 uppercase tracking-widest font-semibold pt-2">
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">Contact</a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">Press Kit</a>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-600 font-light">
            © {new Date().getFullYear()} Lumora Luxury Photography. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default PhotographerDetails;

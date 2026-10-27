import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Camera,
  Clock,
  Check,
  Sparkles,
  X,
  Map,
  Send,
  ArrowRight,
  Shield,
  Loader2,
  Calendar,
  Bookmark,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import photographerService, {
  type PhotographerProfile,
} from "../../services/photographerService";
import { feedService } from "../../services/feedService";
import userService from "../../services/userService";
import { getErrorMessage } from "../../utils/errorUtils";
import bookingService from "../../services/bookingService";

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
}

const PhotographerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState<boolean>(false);
  const [selectedPackageId, setSelectedPackageId] = useState<
    string | undefined
  >(undefined);

  // Dynamic photographer profile from API
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  // Page Interactivity states
  const [activeTab, setActiveTab] = useState<
    "overview" | "portfolio" | "packages" | "reviews" | "policies"
  >("overview");

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    notes: "",
    events: [
      { eventType: "Wedding", eventDate: "", location: "" },
    ],
  });

  // Quotation Form State
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    location: "",
    expectedGuests: "100-300",
    servicesRequired: [] as string[],
  });

  // Saved photographer state
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPhotographerData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const res = await photographerService.getPhotographerById(id);
        if (res.data?.photographer) {
          setProfile(res.data.photographer);
        } else {
          setError("Photographer profile not found.");
        }

        // Fetch saved status for current user
        try {
          const savedRes = await userService.checkIsPhotographerSaved(id);
          if (savedRes.data) {
            setIsSaved(Boolean(savedRes.data.isSaved));
          }
        } catch {
          // Non-blocking if check fails
        }

        // Fetch real portfolio moments from feedService for this photographer
        try {
          const feedRes = await feedService.getFeed({
            photographerId: id,
            limit: 30,
          });
          if (feedRes?.posts && feedRes.posts.length > 0) {
            const photos: GalleryPhoto[] = [];
            feedRes.posts.forEach((post) => {
              post.media?.forEach((m, idx) => {
                photos.push({
                  id: `${post.id}-${idx}`,
                  url: m.url,
                  caption: post.caption,
                });
              });
            });
            setGalleryPhotos(photos);
          } else {
            setGalleryPhotos([]);
          }
        } catch {
          // Non-blocking if feed moments fail to load
          setGalleryPhotos([]);
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(
          err,
          "Failed to load photographer profile."
        );
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographerData();
  }, [id]);

  const handleToggleSave = async () => {
    if (!id || isSaving) return;
    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      const res = await userService.toggleSavePhotographer(id);
      const newState = res.data?.isSaved ?? !prevSaved;
      setIsSaved(newState);
      if (newState) {
        toast.success(
          `${profile?.name || "Photographer"} saved to your collection!`
        );
      } else {
        toast.info("Removed from saved photographers.");
      }
    } catch (err: unknown) {
      setIsSaved(prevSaved);
      toast.error(getErrorMessage(err, "Failed to update saved status."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEvent = () => {
    setBookingForm((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        { eventType: "Reception", eventDate: "", location: "" },
      ],
    }));
  };

  const handleRemoveEvent = (indexToRemove: number) => {
    if (bookingForm.events.length <= 1) return;
    setBookingForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleEventChange = (
    index: number,
    field: "eventType" | "eventDate" | "location",
    value: string
  ) => {
    setBookingForm((prev) => {
      const updated = [...prev.events];
      const target = updated[index];
      if (target) {
        updated[index] = { ...target, [field]: value };
      }
      return { ...prev, events: updated };
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingBooking) return;

    if (!bookingForm.events || bookingForm.events.length === 0) {
      toast.error("Please add at least one event.");
      return;
    }

    const missingDate = bookingForm.events.find((ev) => !ev.eventDate);
    if (missingDate) {
      toast.error(`Please select a date for ${missingDate.eventType}.`);
      return;
    }

    const missingLocation = bookingForm.events.find(
      (ev) => !ev.location || ev.location.trim().length < 2
    );
    if (missingLocation) {
      toast.error(
        `Please enter the shoot location/venue for ${missingLocation.eventType}.`
      );
      return;
    }

    if (!id) {
      toast.error("Photographer not found.");
      return;
    }

    try {
      setIsSubmittingBooking(true);

      await bookingService.createBooking({
        photographerId: id,
        packageId: selectedPackageId,
        events: bookingForm.events,
        notes: bookingForm.notes,
      });

      toast.success(
        `Booking request submitted to ${
          profile?.name || "photographer"
        }! They will respond shortly.`
      );

      setIsBookingModalOpen(false);

      setBookingForm({
        notes: "",
        events: [{ eventType: "Wedding", eventDate: "", location: "" }],
      });

      setSelectedPackageId(undefined);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to submit booking request."));
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) {
      toast.error("Please fill in the required contact information.");
      return;
    }
    const artistName = profile?.name || "The photographer";
    toast.success(
      `Quotation request submitted! ${artistName}'s team will send a detailed price breakdown to your email.`
    );
    setIsQuoteModalOpen(false);
    setQuoteForm({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      location: "",
      expectedGuests: "100-300",
      servicesRequired: [],
    });
  };

  const openBookingForPlan = (packageName: string, packageId?: string) => {
    setSelectedPlan(packageName);
    setSelectedPackageId(packageId);

    setBookingForm((prev) => ({
      ...prev,
      notes: `Interested in the ${packageName} collection.`,
    }));

    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-text-secondary text-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span>Loading artist profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center text-text-secondary p-6">
        <div className="max-w-md w-full bg-[#0f1012] border border-white/5 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Camera size={26} />
          </div>
          <h2 className="text-xl font-heading font-semibold text-white">
            Photographer Not Found
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            {error ||
              "The photographer profile you are looking for does not exist or may have been removed."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate("/feed")}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-gray-300 transition"
            >
              Back to Feed
            </button>
            <button
              onClick={() => navigate("/photographers")}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-black hover:bg-primary/90 transition flex items-center gap-1.5"
            >
              <span>Browse Photographers</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const packagesList = profile.packages || [];

  return (
    <div className="min-h-screen bg-[#070708] text-[#F3F4F6] flex flex-col justify-between font-body select-none">
      <div>
        {/* 1. Artist Cover & Main Details */}
        <div className="w-full relative">
          {/* Cover Photo */}
          <div className="h-72 w-full bg-neutral-950 overflow-hidden relative">
            {profile.coverPhoto ? (
              <img
                src={profile.coverPhoto}
                alt={profile.name}
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-[#0f1012] to-neutral-950 flex items-center justify-center">
                <Camera size={48} className="text-primary/20 stroke-[1]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/40 to-transparent" />
          </div>

          {/* Profile Card Overlay Container */}
          <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Round Avatar with Gold Ring border */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden bg-neutral-900 border-4 border-primary/45 shadow-2xl flex-shrink-0 flex items-center justify-center">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-heading font-bold text-primary">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "P"}
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="mb-2 space-y-2">
                {profile.specialities && profile.specialities.length > 0 && (
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
                )}
                <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-wide text-white">
                  {profile.name}
                </h1>
                {profile.location && (
                  <p className="flex items-center justify-center md:justify-start gap-1 text-xs text-text-secondary">
                    <MapPin size={12} className="text-primary" />
                    <span>{profile.location}</span>
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-400 font-light max-w-xl leading-relaxed">
                  {profile.bio || "No biography provided yet."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer border ${
                  isSaved
                    ? "bg-[#F2C94C]/15 border-[#F2C94C] text-[#F2C94C] shadow-lg shadow-[#F2C94C]/10"
                    : "bg-[#0f1012] border-white/20 text-gray-300 hover:text-white hover:border-white/40"
                }`}
                title={
                  isSaved ? "Saved to your collection" : "Save photographer"
                }
              >
                <Bookmark
                  size={14}
                  className={
                    isSaved ? "fill-[#F2C94C] text-[#F2C94C]" : "text-gray-300"
                  }
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
              <button
                onClick={() =>
                  openBookingForPlan(
                    packagesList[0]?.packageName || "General Inquiry",
                    packagesList[0]?._id
                  )
                }
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
              {
                value: profile.startingPrice
                  ? `₹${profile.startingPrice.toLocaleString("en-IN")}`
                  : "On Request",
                label: "Starting Price",
              },
              {
                value: `${packagesList.length}`,
                label: "Curated Packages",
              },
              {
                value: `${galleryPhotos.length}`,
                label: "Moments & Frames",
              },
              {
                value:
                  profile.serviceAreas && profile.serviceAreas.length > 0
                    ? `${profile.serviceAreas.length} Areas`
                    : profile.location || "Kerala",
                label: "Coverage Region",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#0f1012] border border-white/5 rounded-xl p-5 text-center hover:border-white/10 transition-colors shadow-lg"
              >
                <div className="text-xl md:text-2xl font-bold text-[#F2C94C] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Section Tabs Bar */}
        <div className="border-b border-white/5 w-full bg-[#08080a] sticky top-[72px] z-20">
          <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
            {(
              [
                "overview",
                "portfolio",
                "packages",
                "reviews",
                "policies",
              ] as const
            ).map((tab) => (
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
                    About the Artist
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {profile.bio ||
                      "No biography provided yet by this photographer."}
                  </p>
                </div>

                {/* Equipment & Languages Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0f1012] border border-white/5 p-5 rounded-xl flex items-start gap-4">
                    <div className="p-2.5 bg-white/5 rounded-lg text-[#F2C94C] flex-shrink-0">
                      <Camera size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Equipment
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 font-light leading-relaxed">
                        {profile.equipment && profile.equipment.length > 0
                          ? profile.equipment.join(", ")
                          : "Equipment specifications available on request."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0f1012] border border-white/5 p-5 rounded-xl flex items-start gap-4">
                    <div className="p-2.5 bg-white/5 rounded-lg text-[#F2C94C] flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Languages Spoken
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 font-light leading-relaxed">
                        {profile.languages && profile.languages.length > 0
                          ? profile.languages.join(", ")
                          : "English, Malayalam"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Map/Region details */}
              <div className="bg-[#0f1012]/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between h-[230px] p-5 relative group">
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
                    {profile.serviceAreas && profile.serviceAreas.length > 0
                      ? `Serving ${profile.serviceAreas.map((a) => a.name).join(", ")}`
                      : profile.location
                        ? `Based in ${profile.location}`
                        : "Available across Kerala"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PORTFOLIO / GALLERY */}
          {(activeTab === "portfolio" || activeTab === "overview") && (
            <div className="mt-12 space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
                    Portfolio & Creative Work
                  </h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    Moments and frames published by {profile.name}.
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {galleryPhotos.length}{" "}
                  {galleryPhotos.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-xl overflow-hidden relative group bg-neutral-900 border border-white/5 shadow-md"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || "Portfolio moment"}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {photo.caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-xs text-white/90 line-clamp-2">
                            {photo.caption}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 text-xs border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Camera size={28} className="opacity-40 text-primary" />
                  <span>No portfolio moments uploaded yet.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PACKAGES */}
          {(activeTab === "packages" || activeTab === "overview") && (
            <div className="mt-16 space-y-8">
              <div className="text-center space-y-2 max-w-md mx-auto">
                <h3 className="text-xl md:text-2xl font-semibold tracking-wide text-white">
                  Pricing Packages & Collections
                </h3>
                <p className="text-xs text-gray-400 font-light">
                  Tailored photography coverage designed for your special
                  occasions.
                </p>
              </div>

              {packagesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {packagesList.map((pkg, idx) => {
                    const features = [
                      ...(pkg.description
                        ? pkg.description
                            .split(",")
                            .map((f) => f.trim())
                            .filter(Boolean)
                        : []),
                      ...(pkg.droneIncluded
                        ? ["4K Drone Aerial Coverage"]
                        : []),
                      ...(pkg.albumIncluded
                        ? ["Custom Designed Photo Album"]
                        : []),
                      ...(pkg.framesIncluded
                        ? ["High-Quality Photo Frames"]
                        : []),
                      ...(pkg.videographersIncluded
                        ? ["Dedicated Videography Team"]
                        : []),
                    ];

                    return (
                      <div
                        key={pkg._id || idx}
                        className="bg-[#0f1012]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-md"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                Collection Tier
                              </h4>
                              <h5 className="text-sm font-semibold text-white tracking-wide mt-0.5">
                                {pkg.packageName}
                              </h5>
                            </div>
                            <div className="text-[#F2C94C]">
                              <Sparkles size={16} />
                            </div>
                          </div>

                          {features.length > 0 && (
                            <ul className="space-y-2.5 pt-2">
                              {features.map((feature, fIdx) => (
                                <li
                                  key={fIdx}
                                  className="flex items-center gap-2.5 text-xs text-gray-400"
                                >
                                  <Check
                                    size={12}
                                    className="text-[#F2C94C] shrink-0"
                                  />
                                  <span className="font-light">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="pt-8 space-y-4">
                          <div>
                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest font-bold">
                              Package Price
                            </span>
                            <span className="text-xl font-extrabold text-white">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            onClick={() => openBookingForPlan(pkg.packageName, pkg._id)}
                            className="w-full py-2.5 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all active:scale-98 cursor-pointer text-center bg-[#F2C94C] hover:bg-[#F2C94C]/90 text-neutral-950"
                          >
                            Book This Plan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 text-xs border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 max-w-xl mx-auto">
                  <span>
                    No fixed packages published yet by this photographer.
                  </span>
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold transition cursor-pointer"
                  >
                    Request Custom Quotation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div className="py-12 text-center text-gray-500 text-xs border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2">
                <Star size={24} className="opacity-40 text-primary" />
                <span className="text-sm text-text font-medium">
                  No reviews yet
                </span>
                <span className="text-xs text-text-secondary max-w-xs">
                  Reviews and client ratings for {profile.name} will appear here
                  after verified booking completions.
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: POLICIES */}
          {activeTab === "policies" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Booking & Availability",
                  desc: "Submit a direct booking request to check availability for your event date. The photographer will confirm details directly.",
                },
                {
                  icon: Clock,
                  title: "Timelines & Delivery",
                  desc: "Digital previews and final curated photo albums are delivered in coordination with the photographer's schedule.",
                },
                {
                  icon: Calendar,
                  title: "Custom Inquiries",
                  desc: "Destination shoots, bespoke events, and multi-day coverage can be requested via the quotation form.",
                },
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#0f1012] border border-white/5 p-5 rounded-xl space-y-3"
                  >
                    <div className="p-2 bg-white/5 rounded-lg text-[#F2C94C] w-9 h-9 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <h4 className="text-xs font-semibold text-white">
                      {p.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
              <h3 className="text-lg font-heading font-semibold text-white">
                Book {profile.name}
              </h3>
              {selectedPlan && (
                <div className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider font-semibold">
                  Selected package: {selectedPlan}
                </div>
              )}
              <p className="text-xs text-gray-400">
                Lock your date for event shoots and film capturing.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                    <Calendar size={11} className="text-[#F2C94C]" />
                    <span>Events & Dates *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="text-[10px] text-[#F2C94C] hover:text-[#F2C94C]/80 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus size={11} />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {bookingForm.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#070708] border border-white/10 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-gray-300">
                          Event #{idx + 1}
                        </span>
                        {bookingForm.events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEvent(idx)}
                            className="text-red-400 hover:text-red-300 transition cursor-pointer p-0.5"
                            title="Remove event"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">
                            Type *
                          </label>
                          <select
                            value={ev.eventType}
                            onChange={(e) =>
                              handleEventChange(idx, "eventType", e.target.value)
                            }
                            className="w-full bg-[#121316] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none cursor-pointer"
                          >
                            <option value="Wedding">Wedding</option>
                            <option value="Reception">Reception</option>
                            <option value="Pre-Wedding">Pre-Wedding</option>
                            <option value="Engagement">Engagement</option>
                            <option value="Haldi / Mehendi">Haldi / Mehendi</option>
                            <option value="Sangeet">Sangeet</option>
                            <option value="Post-Wedding">Post-Wedding</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">
                            Date *
                          </label>
                          <input
                            type="date"
                             
                            min={new Date().toISOString().split("T")[0]}
                            value={ev.eventDate}
                            onChange={(e) =>
                              handleEventChange(idx, "eventDate", e.target.value)
                            }
                            className="w-full bg-[#121316] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase tracking-wider">
                          Shoot Location / Venue *
                        </label>
                        <input
                          type="text"
                          required
                          value={ev.location || ""}
                          onChange={(e) =>
                            handleEventChange(idx, "location", e.target.value)
                          }
                          className="w-full bg-[#121316] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                          placeholder="e.g. Grand Hyatt, Kochi"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Selected Plan / Notes
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#F2C94C] outline-none transition resize-none"
                  placeholder="List any extra requirements or custom session timings..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingBooking}
                className="w-full py-2.5 bg-[#F2C94C] hover:bg-[#F2C94C]/95 text-black font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking Request</span>
                    <Send size={10} />
                  </>
                )}
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
              <h3 className="text-lg font-heading font-semibold text-white">
                Request Quotation
              </h3>
              <p className="text-xs text-gray-400">
                Request custom pricing from {profile.name} based on event
                headcount and location details.
              </p>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                     
                    value={quoteForm.name}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                     
                    value={quoteForm.phone}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                  Email Address *
                </label>
                <input
                  type="email"
                   
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Shoot Location
                  </label>
                  <input
                    type="text"
                    value={quoteForm.location}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full bg-[#070708] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#F2C94C] outline-none"
                    placeholder="e.g. Kochi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Event Scale (Guests)
                  </label>
                  <select
                    value={quoteForm.expectedGuests}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        expectedGuests: e.target.value,
                      }))
                    }
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
                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                  Services Needed
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    "Photography",
                    "Videography",
                    "Drone Aerials",
                    "Album Printing",
                  ].map((srv) => {
                    const isChecked = quoteForm.servicesRequired.includes(srv);
                    return (
                      <button
                        type="button"
                        key={srv}
                        onClick={() => {
                          setQuoteForm((prev) => ({
                            ...prev,
                            servicesRequired: isChecked
                              ? prev.servicesRequired.filter((x) => x !== srv)
                              : [...prev.servicesRequired, srv],
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
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-[#F3F4F6] transition-colors">
                Press Kit
              </a>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 font-light">
            © {new Date().getFullYear()} Lumora Photography. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PhotographerDetails;

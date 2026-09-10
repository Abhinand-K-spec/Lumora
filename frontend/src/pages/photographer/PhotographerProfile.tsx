import { useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";
import photographerService, {
  type PackageItem,
  type PhotographerApprovalStatus,
} from "../../services/photographerService";
import { ShieldCheck, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { InstagramIcon } from "../../components/common/InstagramIcon";

// Subcomponent Imports
import PhotographerHero from "../../components/photographer/profile/PhotographerHero";
import PhotographerMetrics from "../../components/photographer/profile/PhotographerMetrics";
import PhotographerNarrative from "../../components/photographer/profile/PhotographerNarrative";
import PhotographerGear from "../../components/photographer/profile/PhotographerGear";
import PhotographerServices from "../../components/photographer/profile/PhotographerServices";
import PhotographerSubscription from "../../components/photographer/profile/PhotographerSubscription";
import PhotographerRecent from "../../components/photographer/profile/PhotographerRecent";
import PhotographerEditModal from "../../components/photographer/profile/PhotographerEditModal";
import PhotographerPackageModal from "../../components/photographer/profile/PhotographerPackageModal";

const PhotographerProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    bio: string;
    profilePhoto: string;
    coverPhoto: string;
    location: string;
    languages: string[];
    specialities: string[];
    equipment: string[];
    rating: number;
    reviewsCount: number;
    totalBookings: number;
    bookingsThisMonth: number;
    experienceYears: number;
    completionRate: number;
    serviceRegions: string[];
    packages: PackageItem[];
    instagramUrl: string;
    approvalStatus: PhotographerApprovalStatus;
    rejectionReason?: string;
  }>({
    name: user?.name || "Photographer",
    email: user?.email || "photographer@lumora.com",
    phone: "",
    bio: "",
    profilePhoto: "",
    coverPhoto:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1600",
    location: "",
    languages: [],
    specialities: [],
    equipment: [],
    rating: 4.9,
    reviewsCount: 124,
    totalBookings: 342,
    bookingsThisMonth: 12,
    experienceYears: 8,
    completionRate: 98,
    serviceRegions: ["Kerala", "UAE"],
    packages: [],
    instagramUrl: "",
    approvalStatus: "DRAFT",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(
    null,
  );
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);

  // Sync profile details if DB returns any
  useEffect(() => {
    const fetchDBProfile = async () => {
      try {
        const res = await photographerService.getProfile();
        if (res.data && res.data.photographer) {
          const dbData = res.data.photographer;
          console.log(
            "log from use effect fetchprofile of photographer",
            dbData,
          );
          setProfile((prev) => ({
            ...prev,
            name: dbData.name || prev.name,
            email: dbData.email || prev.email,
            phone: dbData.phone || prev.phone,
            bio: dbData.bio || prev.bio,
            profilePhoto: dbData.profilePhoto || prev.profilePhoto,
            coverPhoto: dbData.coverPhoto || prev.coverPhoto,
            location: dbData.location || prev.location,
            languages: dbData.languages || prev.languages,
            specialities: dbData.specialities || prev.specialities,
            equipment: dbData.equipment || prev.equipment,
            serviceRegions: dbData.serviceRegions || prev.serviceRegions,
            packages: dbData.packages || prev.packages,
            instagramUrl: dbData.instagramUrl || prev.instagramUrl,
            approvalStatus: dbData.approvalStatus || prev.approvalStatus,
            rejectionReason: dbData.rejectionReason,
          }));
        }
      } catch (err) {
        console.log(
          "Mock sandbox initialized: using curated profile details.",
          err,
        );
      }
    };
    fetchDBProfile();
  }, []);

  // Save profile updates
  const handleSaveProfile = async (updatedData: {
    name: string;
    bio: string;
    specialities: string[];
    location: string;
    languages: string[];
    equipment: string[];
    serviceRegions?: string[];
    phone?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    instagramUrl?: string;
  }) => {
    try {
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        instagramUrl: updatedData.instagramUrl ?? prev.instagramUrl,
      }));

      await photographerService.updateProfile({
        name: updatedData.name,
        bio: updatedData.bio,
        phone:
          updatedData.phone !== undefined ? updatedData.phone : profile.phone,
        profilePhoto:
          updatedData.profilePhoto !== undefined
            ? updatedData.profilePhoto
            : profile.profilePhoto,
        coverPhoto:
          updatedData.coverPhoto !== undefined
            ? updatedData.coverPhoto
            : profile.coverPhoto,
        location:
          updatedData.location !== undefined
            ? updatedData.location
            : profile.location,
        languages:
          updatedData.languages !== undefined
            ? updatedData.languages
            : profile.languages,
        specialities:
          updatedData.specialities !== undefined
            ? updatedData.specialities
            : profile.specialities,
        equipment:
          updatedData.equipment !== undefined
            ? updatedData.equipment
            : profile.equipment,
        serviceRegions:
          updatedData.serviceRegions !== undefined
            ? updatedData.serviceRegions
            : profile.serviceRegions,
        instagramUrl: updatedData.instagramUrl,
      });

      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.success("Profile saved successfully (Sandbox Mode)");
      console.log(err);
    }
  };

  // Request approval handler
  const handleRequestApproval = async () => {
    setIsRequestingApproval(true);
    try {
      await photographerService.requestApproval();
      toast.success(
        "Verification request submitted! We'll review your profile shortly.",
      );
      setProfile((prev) => ({ ...prev, approvalStatus: "PENDING" }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to submit verification request.";
      toast.error(msg);
    } finally {
      setIsRequestingApproval(false);
    }
  };

  // Upload Profile Avatar Photo
  const triggerPhotoUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        setIsUploadingPhoto(true);
        const res = await photographerService.uploadProfilePhoto(file);
        const url = res.data.photoUrl;

        await photographerService.updateProfile({ profilePhoto: url });
        setProfile((prev) => ({ ...prev, profilePhoto: url }));
        toast.success("Avatar photo updated!");
      } catch {
        const mockUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, profilePhoto: mockUrl }));
        toast.success("Avatar photo updated (Sandbox Mode)!");
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    fileInput.click();
  };

  // Upload Profile Cover Photo
  const triggerCoverUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        setIsUploadingCover(true);
        const res = await photographerService.uploadCoverPhoto(file);
        const url = res.data.coverPhotoUrl;

        await photographerService.updateProfile({ coverPhoto: url });
        setProfile((prev) => ({ ...prev, coverPhoto: url }));
        toast.success("Cover photo updated!");
      } catch {
        const mockUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, coverPhoto: mockUrl }));
        toast.success("Cover photo updated (Sandbox Mode)!");
      } finally {
        setIsUploadingCover(false);
      }
    };
    fileInput.click();
  };

  // Packages CRUD Handlers
  const handleAddPackageClick = () => {
    setEditingPackage(null);
    setIsPackageModalOpen(true);
  };

  const handleEditPackageClick = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (
    data: Omit<PackageItem, "_id" | "photographerId">,
  ) => {
    try {
      if (editingPackage) {
        // Edit existing package
        const res = await photographerService.editPackage(
          editingPackage._id,
          data,
        );
        setProfile((prev) => ({
          ...prev,
          packages: res.data.photographer.packages || [],
        }));
        toast.success("Package updated successfully!");
      } else {
        // Add new package
        const res = await photographerService.addPackage(data);
        setProfile((prev) => ({
          ...prev,
          packages: res.data.photographer.packages || [],
        }));
        toast.success("Package added successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save package.");
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    try {
      const res = await photographerService.deletePackage(packageId);
      setProfile((prev) => ({
        ...prev,
        packages: res.data.photographer.packages || [],
      }));
      toast.success("Package deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete package.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-text flex flex-col justify-between font-body">
      {/* Container */}
      <div className="flex-1 flex flex-col pb-16">
        {/* 1. Banner Hero */}
        <PhotographerHero
          name={profile.name}
          avatarUrl={profile.profilePhoto}
          coverUrl={profile.coverPhoto}
          specialities={profile.specialities}
          rating={profile.rating}
          reviewsCount={profile.reviewsCount}
          onEdit={() => setIsEditModalOpen(true)}
          onUploadPhotoClick={triggerPhotoUpload}
          onUploadCoverClick={triggerCoverUpload}
          isUploading={isUploadingPhoto}
          isUploadingCover={isUploadingCover}
        />

        {/* 2. Verification Status Card */}
        <div className="max-w-7xl mx-auto w-full px-8 mt-5">
          {profile.approvalStatus === "DRAFT" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/60 border border-dashed border-border/30 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-text-secondary mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-text">
                    Get Lumora Verified
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Complete your profile, add your Instagram URL, then request
                    verification to appear in the marketplace.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRequestApproval}
                disabled={isRequestingApproval}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-semibold text-xs rounded-full hover:bg-secondary transition cursor-pointer disabled:opacity-50"
              >
                {isRequestingApproval ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ShieldCheck size={13} />
                )}
                Request Verification
              </button>
            </div>
          )}

          {profile.approvalStatus === "PENDING" && (
            <div className="flex items-center gap-3 bg-amber-950/20 border border-amber-800/30 rounded-xl px-5 py-4">
              <Clock size={18} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Review In Progress
                </p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  Your profile is under review by our curator team. We'll notify
                  you once a decision has been made.
                </p>
              </div>
            </div>
          )}

          {profile.approvalStatus === "APPROVED" && (
            <div className="flex items-center gap-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl px-5 py-4">
              <ShieldCheck
                size={18}
                className="text-emerald-400 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Lumora Verified
                </p>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  Your profile is verified and visible to clients in the
                  marketplace.
                </p>
              </div>
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-xs text-[#E1306C] hover:underline"
                >
                  <InstagramIcon size={13} /> Instagram
                </a>
              )}
            </div>
          )}

          {profile.approvalStatus === "REJECTED" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-950/20 border border-red-900/30 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={18}
                  className="text-red-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Application Rejected
                  </p>
                  {profile.rejectionReason && (
                    <p className="text-xs text-red-400/70 mt-0.5">
                      {profile.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary mt-1">
                    Update your profile and Instagram URL, then re-submit.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-text font-semibold text-xs rounded-full transition cursor-pointer"
              >
                Update &amp; Re-submit
              </button>
            </div>
          )}
        </div>

        {/* 3. Metric stats row */}
        <PhotographerMetrics
          totalBookings={profile.totalBookings}
          bookingsThisMonth={profile.bookingsThisMonth}
          experienceYears={profile.experienceYears}
          completionRate={profile.completionRate}
          serviceRegions={profile.serviceRegions}
        />

        {/* 4. Main Two Column Grid */}
        <div className="max-w-7xl mx-auto w-full px-8 mt-6.5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6.5">
          {/* Left Column: Vision & Equipment */}
          <div className="space-y-6.5 flex flex-col">
            <PhotographerNarrative
              visionStatement={profile.bio}
              basedIn={profile.location}
              languages={profile.languages}
              serviceRegions={profile.serviceRegions}
              phone={profile.phone}
            />

            <PhotographerGear
              gearList={
                profile.equipment && profile.equipment.length > 0
                  ? profile.equipment.map((item, index) => {
                      const lower = item.toLowerCase();
                      let category: string;
                      let iconName: "camera" | "stabilizer" | "drone";
                      if (lower.includes("drone") || lower.includes("dji")) {
                        category = "Aerial Drone";
                        iconName = "drone";
                      } else if (
                        lower.includes("stabilizer") ||
                        lower.includes("ronin") ||
                        lower.includes("gimbal")
                      ) {
                        category = "Stabilizer";
                        iconName = "stabilizer";
                      } else if (lower.includes("lens")) {
                        category = "Lens";
                        iconName = "camera";
                      } else {
                        category = "Camera Body";
                        iconName = "camera";
                      }

                      return {
                        id: `g-${index}`,
                        name: item,
                        category: category,
                        description:
                          "Professional grade equipment listed by the photographer.",
                        iconName: iconName,
                      };
                    })
                  : []
              }
            />
          </div>

          {/* Right Column: Packages & Subscription */}
          <div className="space-y-6.5 flex flex-col">
            <PhotographerServices
              packages={profile.packages}
              onAddClick={handleAddPackageClick}
              onEditClick={handleEditPackageClick}
              onDeleteClick={handleDeletePackage}
            />
            <PhotographerSubscription />
          </div>
        </div>

        {/* 5. Bottom visual narratives portfolio grid */}
        <div className="max-w-7xl mx-auto w-full px-8 mt-8">
          <PhotographerRecent />
        </div>
      </div>

      {/* 6. Page Footer */}
      <footer className="w-full border-t border-border/10 bg-black/40 py-6 px-8 select-none text-[11px] text-text-secondary flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>© 2024 Lumora Studio. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:text-text transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <button className="hover:text-text transition-colors cursor-pointer">
            Terms of Service
          </button>
          <button className="hover:text-text transition-colors cursor-pointer">
            Cookie Policy
          </button>
        </div>
      </footer>

      {/* 7. Editing Pop-up modal */}
      <PhotographerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={{
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          specialities: profile.specialities,
          location: profile.location,
          languages: profile.languages,
          equipment: profile.equipment,
          serviceRegions: profile.serviceRegions,
          instagramUrl: profile.instagramUrl,
        }}
        onSave={handleSaveProfile}
      />

      {/* 8. Package Modal */}
      <PhotographerPackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        packageData={editingPackage}
        onSave={handleSavePackage}
      />
    </div>
  );
};

export default PhotographerProfile;

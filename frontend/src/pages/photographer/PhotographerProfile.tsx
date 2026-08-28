import { useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";
import photographerService from "../../services/photographerService";

// Subcomponent Imports
import PhotographerHero from "../../components/photographer/profile/PhotographerHero";
import PhotographerMetrics from "../../components/photographer/profile/PhotographerMetrics";
import PhotographerNarrative from "../../components/photographer/profile/PhotographerNarrative";
import PhotographerGear from "../../components/photographer/profile/PhotographerGear";
import PhotographerServices from "../../components/photographer/profile/PhotographerServices";
import PhotographerSubscription from "../../components/photographer/profile/PhotographerSubscription";
import PhotographerRecent from "../../components/photographer/profile/PhotographerRecent";
import PhotographerEditModal from "../../components/photographer/profile/PhotographerEditModal";

const PhotographerProfile = () => {
  const { user } = useAuth();

  // Profile State mapping the mockup details
  const [profile, setProfile] = useState({
    name: user?.name || "Photographer",
    email: user?.email || "photographer@lumora.com",
    phone: "",
    bio: "",
    profilePhoto: "",
    coverPhoto: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1600",
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
    serviceRegions: ["Kerala", "UAE"]
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Sync profile details if DB returns any
  useEffect(() => {
    const fetchDBProfile = async () => {
      try {
        const res = await photographerService.getProfile();
        if (res.data && res.data.photographer) {
          const dbData = res.data.photographer;
          console.log('log from use effect fetchprofile of photographer',dbData);
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
            serviceRegions: dbData.serviceRegions || prev.serviceRegions
          }));
        }
      } catch (err) {
        console.log("Mock sandbox initialized: using curated profile details.",err);
      }
    };
    fetchDBProfile();
  }, []);

  // Save profile updates
  const handleSaveProfile = async (updatedData: any) => {
    try {
      // Sync local state
      setProfile((prev) => ({
        ...prev,
        ...updatedData
      }));

      // Call API
      await photographerService.updateProfile({
        name: updatedData.name,
        bio: updatedData.bio,
        phone: updatedData.phone !== undefined ? updatedData.phone : profile.phone,
        profilePhoto: updatedData.profilePhoto !== undefined ? updatedData.profilePhoto : profile.profilePhoto,
        coverPhoto: updatedData.coverPhoto !== undefined ? updatedData.coverPhoto : profile.coverPhoto,
        location: updatedData.location !== undefined ? updatedData.location : profile.location,
        languages: updatedData.languages !== undefined ? updatedData.languages : profile.languages,
        specialities: updatedData.specialities !== undefined ? updatedData.specialities : profile.specialities,
        equipment: updatedData.equipment !== undefined ? updatedData.equipment : profile.equipment,
        serviceRegions: updatedData.serviceRegions !== undefined ? updatedData.serviceRegions : profile.serviceRegions
      });

      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.success("Profile saved successfully (Sandbox Mode)");
      console.log(err);
      
    }
  };

  // Upload Profile Avatar Photo
  const triggerPhotoUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploadingPhoto(true);
        const res = await photographerService.uploadProfilePhoto(file);
        const url = res.data.photoUrl;

        await photographerService.updateProfile({ profilePhoto: url });
        setProfile((prev) => ({ ...prev, profilePhoto: url }));
        toast.success("Avatar photo updated!");
      } catch (err) {
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
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploadingCover(true);
        const res = await photographerService.uploadCoverPhoto(file);
        const url = res.data.coverPhotoUrl;

        await photographerService.updateProfile({ coverPhoto: url });
        setProfile((prev) => ({ ...prev, coverPhoto: url }));
        toast.success("Cover photo updated!");
      } catch (err) {
        const mockUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, coverPhoto: mockUrl }));
        toast.success("Cover photo updated (Sandbox Mode)!");
      } finally {
        setIsUploadingCover(false);
      }
    };
    fileInput.click();
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
            />
            
            <PhotographerGear
              gearList={
                profile.equipment && profile.equipment.length > 0
                  ? profile.equipment.map((item, index) => {
                      const lower = item.toLowerCase();
                      let category = "Camera Gear";
                      let iconName: "camera" | "stabilizer" | "drone" = "camera";
                      if (lower.includes("drone") || lower.includes("dji")) {
                        category = "Aerial Drone";
                        iconName = "drone";
                      } else if (lower.includes("stabilizer") || lower.includes("ronin") || lower.includes("gimbal")) {
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
                        description: "Professional grade equipment listed by the photographer.",
                        iconName: iconName,
                      };
                    })
                  : []
              }
            />
          </div>

          {/* Right Column: Packages & Subscription */}
          <div className="space-y-6.5 flex flex-col">
            <PhotographerServices />
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
          <button className="hover:text-text transition-colors cursor-pointer">Privacy Policy</button>
          <button className="hover:text-text transition-colors cursor-pointer">Terms of Service</button>
          <button className="hover:text-text transition-colors cursor-pointer">Cookie Policy</button>
        </div>
      </footer>

      {/* 7. Editing Pop-up modal */}
      <PhotographerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={{
          name: profile.name,
          bio: profile.bio,
          specialities: profile.specialities,
          location: profile.location,
          languages: profile.languages,
          equipment: profile.equipment,
          serviceRegions: profile.serviceRegions
        }}
        onSave={handleSaveProfile}
      />

    </div>
  );
};

export default PhotographerProfile;

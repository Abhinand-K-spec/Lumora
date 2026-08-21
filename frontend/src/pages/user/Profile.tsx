import { useEffect, useState } from "react";

import ProfileHeader from "../../components/user/profile/ProfileHeader";
import ProfileSidebar from "../../components/user/profile/ProfileSidebar";
import ProfileOverview from "../../components/user/profile/ProfileOverview";
import EditProfileForm from "../../components/user/profile/EditProfileForm";

import type { UserProfile } from "../../types/profile";
import userService from "../../services/userService";
import { toast } from "sonner";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handlePhotoUpdated = (newPhotoUrl:string)=>{
    setProfile((prev)=>{
        if(!prev) return null;
        return{
            ...prev,
            profilePhoto:newPhotoUrl
        }
    })
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getProfile();
        setProfile(response.data.user);
      } catch (error) {
        toast.error("User profile fetching failed");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">Loading...</div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#111111] text-white">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Navbar */}

      <main className="mx-auto max-w-7xl px-8 py-10">
        {/* Profile Header */}
        <section>
          <ProfileHeader
            name={profile.name}
            profilePhoto={profile.profilePhoto}
            eventsCount={0} 
            followingCount={0}
            onEdit={() => setIsEditing(true)}
            onProfileUploadSuccess={handlePhotoUpdated}
          />
        </section>

        {/* Profile Content */}
        <section className="mt-12 grid grid-cols-[290px_1fr] gap-6">
          {/* Sidebar */}
          <aside>
            <ProfileSidebar />
          </aside>

          {/* Main Content */}
          <div>
            {isEditing ? (
              <EditProfileForm
                profile={profile}
                onCancel={() => setIsEditing(false)}
                onSuccess={handleProfileUpdated}
              />
            ) : (
              <ProfileOverview
                name={profile.name}
                email={profile.email}
                phone={profile.phone}
                profile={profile.profilePhoto}
              />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
    </div>
  );
};

export default Profile;

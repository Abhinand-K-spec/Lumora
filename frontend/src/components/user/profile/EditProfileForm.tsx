import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";

import type { UserProfile } from "../../../types/profile";
import userService from "../../../services/userService";
import { profileSchema, type ProfileFormData } from "../../../schemas/profileSchema";
import Input from "../../common/Input";

interface EditProfileFormProps {
  profile: UserProfile;
  onCancel: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
}

const EditProfileForm = ({
  profile,
  onCancel,
  onSuccess,
}: EditProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      profilePhoto: profile.profilePhoto ?? "",
    },
  });

  // Keep form in sync if the profile prop changes
  useEffect(() => {
    reset({
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      profilePhoto: profile.profilePhoto ?? "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      const response = await userService.updateProfile(data);
      toast.success("Profile updated successfully!");
      onSuccess(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update profile");
      } else {
        toast.error("Something went wrong");
      }
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-[#292929] bg-[#151515] p-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-gray-100">
            Edit Profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Update your personal information.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#242424] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <div className="mt-10 space-y-7">
        {/* Name + Email */}
        <div className="grid grid-cols-2 gap-7">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="space-y-2">
            <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-[#181818] py-3 px-4 text-text-secondary outline-none"
            />
            <p className="mt-2 text-xs text-gray-600">
              Email changes require verification.
            </p>
          </div>
        </div>

        {/* Phone */}
        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter your phone number"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Actions */}
      <div className="mt-10 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg px-6 py-3 text-sm text-gray-400 transition hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-[#f5c76b] px-8 py-3 text-sm font-medium text-black transition hover:bg-[#ffd98a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
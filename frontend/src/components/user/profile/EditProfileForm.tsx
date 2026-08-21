import { useEffect, useState } from "react";
import React from "react";
import { X } from "lucide-react";

import type {UserProfile} from "../../../types/profile";
import userService from "../../../services/userService";

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
    const [formData, setFormData] = useState({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        profilePhoto: profile.profilePhoto ?? "",
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            name: profile.name ?? "",
            phone: profile.phone ?? "",
            profilePhoto: profile.profilePhoto ?? "",
        });
    }, [profile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsSaving(true);

            const response = await userService.updateProfile(formData);
            onSuccess(response.data.user);

        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
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

                    <div>
                        <label
                            htmlFor="name"
                            className="mb-3 block text-sm text-gray-300"
                        >
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full rounded-lg border border-[#303030] bg-[#1c1c1c] px-4 py-3 text-sm text-gray-200 outline-none transition focus:border-[#f5c76b]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-3 block text-sm text-gray-300"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full cursor-not-allowed rounded-lg border border-[#303030] bg-[#181818] px-4 py-3 text-sm text-gray-500 outline-none"
                        />

                        <p className="mt-2 text-xs text-gray-600">
                            Email changes require verification.
                        </p>
                    </div>

                </div>

                {/* Phone */}
                <div>
                    <label
                        htmlFor="phone"
                        className="mb-3 block text-sm text-gray-300"
                    >
                        Phone Number
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full rounded-lg border border-[#303030] bg-[#1c1c1c] px-4 py-3 text-sm text-gray-200 outline-none transition focus:border-[#f5c76b]"
                    />
                </div>



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
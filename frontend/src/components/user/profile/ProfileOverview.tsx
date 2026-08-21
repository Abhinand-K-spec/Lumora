interface ProfileOverviewProps {
    name: string;
    email: string;
    profile: string;
    phone: string;
}

const ProfileOverview = ({
    name,
    email,
    phone,
}: ProfileOverviewProps) => {
    return (
        <div className="rounded-xl border border-[#292929] bg-[#151515] p-10">

            <h2 className="font-serif text-3xl text-gray-100">
                Account Settings
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-7">

                {/* Name */}
                <div>
                    <label className="mb-3 block text-sm text-gray-300">
                        Full Name
                    </label>

                    <input
                        value={name}
                        readOnly
                        className="w-full rounded-lg border border-[#303030] bg-[#1c1c1c] px-4 py-3 text-sm text-gray-300 outline-none"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="mb-3 block text-sm text-gray-300">
                        Email Address
                    </label>

                    <input
                        value={email}
                        readOnly
                        className="w-full rounded-lg border border-[#303030] bg-[#1c1c1c] px-4 py-3 text-sm text-gray-500 outline-none"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="mb-3 block text-sm text-gray-300">
                        Phone
                    </label>

                    <input
                        value={phone}
                        readOnly
                        className="w-full rounded-lg border border-[#303030] bg-[#1c1c1c] px-4 py-3 text-sm text-gray-300 outline-none"
                    />
                </div>

            </div>

        </div>
    );
};

export default ProfileOverview;
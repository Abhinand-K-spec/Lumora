import { Pencil, Share2 } from "lucide-react";


interface ProfileHeaderProps {
    name: string;
    profilePhoto: string;
    eventsCount: number;
    followingCount: number;
    onEdit: () => void;
}

const ProfileHeader = ({
    name,
    profilePhoto,
    eventsCount,
    followingCount,
    onEdit,
}: ProfileHeaderProps) => {
    return (
        <div className="flex items-center justify-between">

            <div className="flex items-center gap-10">

                {/* Avatar */}
                <div className="relative">
                    <img
                        src={profilePhoto || name?.slice(0,1)}
                        alt={name}
                        className="h-44 w-44 rounded-full object-cover ring-4 ring-[#252525]"
                    />

                    <button
                        type="button"
                        className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5c76b] text-black"
                    >
                        <Pencil size={18}/>
                    </button>
                </div>

                {/* User information */}
                <div>
                    <h1 className="font-serif text-5xl font-semibold text-[#f5c76b]">
                        {name}
                    </h1>

                    {/* Stats */}
                    <div className="mt-7 flex gap-12">

                        <div>
                            <p className="font-serif text-2xl text-[#f5c76b]">
                                {eventsCount || '12'}
                            </p>

                            <span className="text-xs uppercase tracking-widest text-gray-500">
                                Events
                            </span>
                        </div>

                        <div>
                            <p className="font-serif text-2xl text-[#f5c76b]">
                                {followingCount || '2.3k'}
                            </p>

                            <span className="text-xs uppercase tracking-widest text-gray-500">
                                Following
                            </span>
                        </div>

                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">

                <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-lg bg-[#f5c76b] px-10 py-4 text-sm font-medium text-black transition hover:bg-[#ffd98a]"
                >
                    Edit Profile
                </button>

                <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#333] text-gray-300 transition hover:bg-[#1d1d1d]"
                >
                        <Share2 size={18}/>
                </button>

            </div>

        </div>
    );
};

export default ProfileHeader;
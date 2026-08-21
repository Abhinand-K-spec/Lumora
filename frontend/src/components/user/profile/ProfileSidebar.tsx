import {
    User,
    Bell,
    MessageSquare,
    CalendarDays,
    LogOut,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const ProfileSidebar = () => {
    const { logout } = useAuth();

    return (
        <div className="rounded-xl border border-[#292929] bg-[#151515] p-7">

            <h2 className="font-serif text-2xl text-[#f5c76b]">
                Account
            </h2>

            <nav className="mt-7 space-y-3">

                <button className="flex w-full items-center gap-4 rounded-lg bg-[#292929] px-4 py-4 text-left text-sm text-[#f5c76b]">
                    <User size={18} />
                    Profile Overview
                </button>

                <button className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-sm text-gray-400 transition hover:bg-[#202020]">
                    <Bell size={18} />
                    Notifications
                </button>

                <button className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-sm text-gray-400 transition hover:bg-[#202020]">
                    <MessageSquare size={18} />
                    My Reviews
                </button>

                <button className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-sm text-gray-400 transition hover:bg-[#202020]">
                    <CalendarDays size={18} />
                    My Requests
                </button>

            </nav>

            <div className="my-8 border-t border-[#292929]" />

            <button 
                onClick={logout}
                className="flex w-full items-center gap-4 px-4 py-3 text-sm text-red-300 cursor-pointer hover:bg-neutral-900/60 rounded-lg transition"
            >
                <LogOut size={18} />
                Sign Out
            </button>

        </div>
    );
};

export default ProfileSidebar;
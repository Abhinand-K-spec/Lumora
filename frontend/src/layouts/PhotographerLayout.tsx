import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Camera,
  MessageSquare,
  BarChart3,
  Coins,
  LogOut,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import photographerService, { type PhotographerProfile } from "../services/photographerService";

const PhotographerLayout = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const location = useLocation();

  // Fetch photographer profile details (including photo) on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await photographerService.getProfile();
        setProfile(res.data.photographer);
      } catch (err) {
        console.error("Failed to load photographer profile in layout:", err);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/photographer/dashboard", icon: LayoutDashboard },
    { label: "Bookings", path: "/photographer/bookings", icon: Calendar },
    { label: "Events", path: "/photographer/events", icon: Camera },
    { label: "Chat", path: "/photographer/chat", icon: MessageSquare },
    { label: "Analytics", path: "/photographer/analytics", icon: BarChart3 },
    { label: "Financials", path: "/photographer/financials", icon: Coins },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-text font-body">
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-[#0B0C0E] border-r border-border/20 flex flex-col justify-between select-none">
        <div>
          {/* Logo brand header matching user side name placement styling */}
          <div className="px-8 py-8">
            <Link
              to="/"
              className="font-heading text-2xl font-semibold tracking-wider text-primary hover:opacity-90 transition"
            >
              Lumora
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? "bg-neutral/40 text-primary font-medium"
                      : "text-text-secondary hover:text-text hover:bg-neutral-900/30"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-text-secondary group-hover:text-text"
                    }
                  />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-0 top-0 h-full w-[2px] bg-primary rounded-l-md" />
                  )}
                </NavLink>
              );
            })}

          </nav>
        </div>

        {/* Bottom Photographer Info Card */}
        <div className="px-6 pb-8 border-t border-border/10 pt-6 flex items-center justify-between gap-2">
          <Link to="/profile" className="flex items-center gap-3 group min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold transition-all flex-shrink-0">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || "P"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-text group-hover:text-primary truncate transition">
                {user?.name || "Photographer"}
              </h4>
              <p className="text-xs text-text-secondary truncate">
                Lead Artist
              </p>
            </div>
          </Link>

          {/* Sign Out Button next to Profile */}
          <button
            onClick={handleLogout}
            className="text-text-secondary hover:text-red-400 transition-colors duration-200 cursor-pointer p-1.5 hover:bg-neutral-900/40 rounded-lg flex-shrink-0"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PhotographerLayout;

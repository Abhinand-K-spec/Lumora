import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Camera,
  Calendar,
  Sliders,
  BarChart3,
  HelpCircle,
  Settings,
  Search,
  Bell,
  History,
  Moon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import useAdminAuth from "../hooks/useAdminAuth";

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Admin logout failed:", err);
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Photographers", path: "/admin/photographers", icon: Camera },
    { label: "Bookings", path: "/admin/bookings", icon: Calendar },
    { label: "Moderation", path: "/admin/moderation", icon: Sliders },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  ];

  const bottomItems = [
    { label: "Support Center", path: "/admin/support", icon: HelpCircle },
    { label: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-text font-body">
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-[#0B0C0E] border-r border-border/20 flex flex-col justify-between select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="px-8 py-8 flex flex-col gap-1">
            <span className="font-heading text-[25px] font-semibold tracking-wider text-primary leading-none">
              Lumora
            </span>
            <span className="font-heading text-[25px] font-semibold tracking-wider text-primary leading-none">
              Admin
            </span>
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

        {/* Bottom Sidebar Options */}
        <div className="pb-8">
          <div className="mx-4 my-4 border-t border-border/10" />
          <nav className="flex flex-col gap-1 px-4">
            {bottomItems.map((item) => {
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
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
        {/* Top Header Bar */}
        <header className="h-18 border-b border-border/20 px-8 flex items-center justify-between bg-black">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/50">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Global system search..."
              className="bg-[#121214] border border-border/20 rounded-lg pl-10 pr-4 py-2 text-sm text-text-secondary placeholder-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 w-80 transition-all"
            />
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-6">
            {/* Quick Action Icons */}
            <div className="flex items-center gap-4 text-text-secondary">
              <button className="hover:text-text cursor-pointer transition">
                <Bell size={18} />
              </button>
              <button className="hover:text-text cursor-pointer transition">
                <History size={18} />
              </button>
              <button className="hover:text-text cursor-pointer transition">
                <Moon size={18} />
              </button>
            </div>

            <div className="h-6 w-[1px] bg-border/20" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer group focus:outline-none select-none text-left"
              >
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-text group-hover:text-primary transition leading-none">
                    Admin Profile
                  </p>
                  <p className="text-[10px] text-primary/80 mt-1 font-light leading-none">
                    Super User
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-all select-none">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <ChevronDown
                  size={14}
                  className="text-text-secondary group-hover:text-text transition"
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-neutral border border-border rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-border/40 mb-1">
                    <p className="text-sm font-semibold text-text truncate">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {admin?.email || "admin@lumora.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-neutral-900/60 transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <LogOut size={16} />
                    Logout Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

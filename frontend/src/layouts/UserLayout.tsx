import {  useRef } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Search } from "lucide-react";
import useAuth from "../hooks/useAuth";

const UserLayout = () => {
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);


  const navItems = [
    { label: "Feed", path: "/" },
    { label: "Photographers", path: "/photographers" },
    { label: "My Events", path: "/my-events" },
    { label: "Saved", path: "/saved" },
    { label: "Messages", path: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-black text-text flex flex-col font-body">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-2xl font-semibold tracking-wider text-primary hover:opacity-90 transition"
          >
            Lumora
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-text-secondary hover:text-text"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Search & Profile */}
          <div className="flex items-center gap-6">
            <button className="text-text-secondary hover:text-text cursor-pointer transition-colors duration-200">
              <Search size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/20 transition-all select-none focus:outline-none"
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Link>

              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;

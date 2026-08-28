import { Search, Bell } from "lucide-react";

interface PhotographerHeaderProps {
  name: string;
  avatarUrl?: string;
  role?: string;
}

const PhotographerHeader = ({
  name = "Arjun Nair",
  avatarUrl,
  role = "PRO ARTIST",
}: PhotographerHeaderProps) => {
  return (
    <header className="h-20 w-full border-b border-border/10 bg-black flex items-center justify-between px-8 select-none">
      
      {/* 1. Search Bar */}
      <div className="relative w-96 max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search sessions, clients, or assets..."
          className="w-full h-10 pl-11 pr-4 bg-[#111214] text-text border border-border/30 rounded-full text-xs outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* 2. Notification & Profile actions */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <button className="relative w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text hover:bg-neutral-900/50 rounded-full transition-colors cursor-pointer">
          <Bell size={18} />
          {/* Unread dot */}
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-black" />
        </button>

        {/* Profile Card badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <h4 className="text-xs font-semibold text-text tracking-wide">{name}</h4>
            <span className="inline-block mt-0.5 text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 uppercase tracking-widest px-1.5 py-0.5 rounded">
              {role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold font-heading">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

      </div>

    </header>
  );
};

export default PhotographerHeader;

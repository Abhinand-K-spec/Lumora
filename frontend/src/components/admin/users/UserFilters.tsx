interface UserFiltersProps {
  statusValue: string;
  onStatusChange: (status: string) => void;
  searchValue: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
}

const UserFilters = ({
  statusValue,
  onStatusChange,
  searchValue,
  onSearchChange,
  totalCount,
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-border/40 bg-[#121214]/20 rounded-lg px-6 py-3.5 shadow-sm">
      {/* Left: Status Pills */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          Status:
        </span>
        <div className="flex items-center gap-1.5 bg-[#0A0A0A]/50 p-1 border border-border/20 rounded-lg">
          {/* ALL status pill */}
          <button
            onClick={() => onStatusChange("ALL")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition cursor-pointer ${
              statusValue === "ALL"
                ? "bg-primary text-tertiary shadow"
                : "text-text-secondary hover:text-text hover:bg-white/5"
            }`}
          >
            All
          </button>

          {/* ACTIVE status pill */}
          <button
            onClick={() => onStatusChange("ACTIVE")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition cursor-pointer ${
              statusValue === "ACTIVE"
                ? "bg-primary text-tertiary shadow"
                : "text-text-secondary hover:text-text hover:bg-white/5"
            }`}
          >
            Active
          </button>

          {/* SUSPENDED status pill */}
          <button
            onClick={() => onStatusChange("SUSPENDED")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition cursor-pointer ${
              statusValue === "SUSPENDED"
                ? "bg-primary text-tertiary shadow"
                : "text-text-secondary hover:text-text hover:bg-white/5"
            }`}
          >
            Suspended Users
          </button>
        </div>
      </div>

      {/* Middle: Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md lg:mx-8">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary shrink-0">
          Name
        </span>
        <div className="relative w-full">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name..."
            className="w-full bg-transparent text-text text-sm py-1.5 outline-none placeholder:text-text-secondary/60 focus:border-b focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* Right: Count */}
      <div className="text-[11px] text-text-secondary/80 shrink-0 self-end lg:self-center">
        Showing <span className="font-semibold text-primary">{totalCount}</span>{" "}
        total users
      </div>
    </div>
  );
};

export default UserFilters;

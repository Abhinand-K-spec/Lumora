import { User, Camera } from "lucide-react";

interface RoleSelectorProps {
  value: "USER" | "PHOTOGRAPHER";
  onChange: (role: "USER" | "PHOTOGRAPHER") => void;
}

const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="mt-6">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Select Role
      </label>

      <div className="flex rounded-xl border border-border bg-card p-1">
        {/* User Button */}
        <button
          type="button"
          onClick={() => onChange("USER")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 transition-all duration-300 ${
            value === "USER"
              ? "bg-primary text-tertiary shadow-md"
              : "text-text-secondary hover:text-text"
          }`}
        >
          <User size={18} />
          <span>User</span>
        </button>

        {/* Photographer Button */}
        <button
          type="button"
          onClick={() => onChange("PHOTOGRAPHER")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 transition-all duration-300 ${
            value === "PHOTOGRAPHER"
              ? "bg-primary text-tertiary shadow-md"
              : "text-text-secondary hover:text-text"
          }`}
        >
          <Camera size={18} />
          <span>Photographer</span>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

const Input = ({
  label,
  icon,
  error,
  className = "",
  type,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
        {label}
      </label>

      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`
            w-full
            rounded-xl
            border
            ${error ? "border-red-500" : "border-border"}
            bg-card
            py-3
            ${icon ? "pl-12" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            text-text
            placeholder:text-text-secondary
            outline-none
            transition-all
            duration-200
            focus:border-primary
            focus:ring-1
            focus:ring-primary/30
            ${className}
          `}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-primary"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
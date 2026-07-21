import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: ReactNode;
}

const Input = ({
    label,
    icon,
    className = "",
    ...props
}: InputProps) => {
    return (
        <div className="space-y-2">

            <label className="font-body text-xs uppercase tracking-widest text-text-secondary">
                {label}
            </label>

            <div className="relative">

                <input
                    className={`
                        w-full
                        rounded-lg
                        border
                        border-border
                        bg-card
                        px-4
                        py-3
                        pr-10
                        text-text
                        outline-none
                        transition
                        focus:border-primary
                        ${className}
                    `}
                    {...props}
                />

                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        {icon}
                    </div>
                )}

            </div>

        </div>
    );
};

export default Input;
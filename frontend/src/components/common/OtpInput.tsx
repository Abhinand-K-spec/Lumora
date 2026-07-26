import { useRef } from "react";

interface OTPInputProps {
    value: string[];
    onChange: (value: string[]) => void;
}

const OTPInput = ({ value, onChange }: OTPInputProps) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const digit = e.target.value.replace(/\D/g, "").slice(-1);

        const newOtp = [...value];
        newOtp[index] = digit;

        onChange(newOtp);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (
            e.key === "Backspace" &&
            !value[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>
    ) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        const newOtp = [...value];

        pasted.split("").forEach((char, i) => {
            newOtp[i] = char;
        });

        onChange(newOtp);

        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="mt-14 flex justify-between gap-4">
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="
                        h-20
                        w-16
                        rounded-xl
                        border
                        border-[#3A3A3A]
                        bg-[#2A2A2A]
                        text-center
                        text-3xl
                        text-white
                        outline-none
                        transition
                        focus:border-primary
                    "
                />
            ))}
        </div>
    );
};

export default OTPInput;
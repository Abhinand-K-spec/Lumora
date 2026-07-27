import { useEffect, useMemo, useState } from "react";
import logo from "../../assets/logos/Logo_only.png";
import Input from "../../components/common/Input";
import authService from "../../services/authService";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();
    


    const email = state?.email;
    const otp = state?.otp;

    // Password checks

    const checks = useMemo(() => ({
        length: password.length >= 8,
        letters: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }), [password]);

    const strength = useMemo(() => {
        const passed = Object.values(checks).filter(Boolean).length;
    
        if (passed <= 1) {
            return {
                label: "Weak",
                bars: 1,
                color: "text-red-500",
                barColor: "bg-red-500",
            };
        }
    
        if (passed === 2) {
            return {
                label: "Good",
                bars: 3,
                color: "text-primary",
                barColor: "bg-primary",
            };
        }
    
        return {
            label: "Strong",
            bars: 4,
            color: "text-green-500",
            barColor: "bg-green-500",
        };
    }, [checks]);


    useEffect(() => {
        if (!email || !otp) {
            toast.error("Invalid access. Please request a password reset first.");
            navigate("/forgotPassword");
        }
    }, [email, otp, navigate]);
    





    const handleSubmit = async()=>{

        try {
            
            setLoading(true);

            await authService.resetPassword({email,otp,newPassword:password});

            toast.success("Password updated successfully.");

            navigate("/login");

        } catch (error) {

            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? "Failed to update password.");
            } else {
                toast.error("Failed to update password.");
            }
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#111111] flex flex-col">

            {/* Header */}

            <header className="px-10 pt-8">
                <img
                    src={logo}
                    alt="Lumora"
                    className="w-14"
                />
            </header>

            {/* Main */}

            <main className="flex flex-1 items-center justify-center px-6">

                <div
                    className="
                        w-full
                        max-w-[560px]
                        rounded-3xl
                        border
                        border-[#2B2B2B]
                        bg-[#171717]
                        px-14
                        py-14
                    "
                >

                    {/* Title */}

                    <h1 className="text-center text-3xl font-semibold text-primary">
                        Reset Password
                    </h1>

                    <p className="mt-5 text-center text-s text-secondary leading-relaxed">
                        Create a strong password to secure
                        your Lumora account.
                    </p>

                    {/* Password */}

                    <div className="mt-8">

                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        >

                            {/* Strength */}

                            <div className="mt-5">

                                <div className="flex items-center justify-between">

                                    <span className="text-sm text-secondary">
                                        Password Strength
                                    </span>

                                    <span  className={`font-medium transition-colors duration-300 ${strength.color}`}>
                                        {strength.label}
                                    </span>

                                </div>

                                {/* Strength Bar */}

                                <div className="mt-4 flex gap-2">

                                    {[1, 2, 3, 4].map((bar) => (

                                        <div
                                            key={bar}
                                            className={`
                                                h-[3px]
                                                flex-1
                                                rounded-full
                                                transition-all
                                                duration-300
                                                ${
                                                    bar <= strength.bars
                                                        ? strength.barColor
                                                        :"bg-[#353535]"
                                                }
                                            `}
                                        />

                                    ))}

                                </div>

                                {/* Password Rules */}

                                <div className="mt-6 space-y-2">

                                    <Requirement
                                        valid={checks.length}
                                        text="Minimum 8 characters"
                                    />

                                    <Requirement
                                        valid={checks.letters}
                                        text="Uppercase, lowercase & number"
                                    />

                                    <Requirement
                                        valid={checks.special}
                                        text="One special character"
                                    />

                                </div>

                            </div>

                        </Input>

                    </div>
            {/* Confirm Password */}

            <div className="mt-12">

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                    />

                    {confirmPassword && (

                        <div className="mt-3">

                            {password === confirmPassword ? (

                                <p className="text-sm text-green-500">
                                    Passwords match
                                </p>

                            ) : (

                                <p className="text-sm text-red-400">
                                    Passwords do not match
                                </p>

                            )}

                        </div>

                    )}

                    </div>

                    {/* Divider */}

                    <div className="my-10 border-t border-[#2B2B2B]" />

                    {/* Update Button */}

                    <button
                    disabled={
                        loading ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword
                    }
                    onClick={handleSubmit}
                    className={`
                        flex
                        w-full
                        items-center
                        justify-center
                        rounded-xl
                        py-4
                        font-semibold
                        tracking-[0.25em]
                        transition-all
                        duration-300

                        ${
                            loading ||
                            !password ||
                            !confirmPassword ||
                            password !== confirmPassword
                                ? "cursor-not-allowed bg-[#353535] text-[#777777]"
                                : "bg-primary text-[#111111] hover:bg-[#E7BA64]"
                        }
                    `}
                    >

                    {loading
                        ? "UPDATING..."
                        : "SAVE NEW PASSWORD"}

                    </button>

                    </div>

                    </main>

                    </div>
                    );
                    };

                    interface RequirementProps {
                    valid: boolean;
                    text: string;
                    }

                    const Requirement = ({
                    valid,
                    text,
                    }: RequirementProps) => {

                    return (

                    <div className="flex items-center gap-3">

                    <div
                    className={`
                    h-2
                    w-2
                    rounded-full
                    transition-colors
                    duration-300
                    ${
                    valid
                        ? "bg-primary"
                        : "bg-[#555555]"
                    }
                    `}
                    />

                    <p
                    className={`
                    text-sm
                    transition-colors
                    duration-300
                    ${
                    valid
                        ? "text-white"
                        : "text-secondary"
                    }
                    `}
                    >
                    {text}
                    </p>

                    </div>

                    );

};

export default ResetPasswordPage;
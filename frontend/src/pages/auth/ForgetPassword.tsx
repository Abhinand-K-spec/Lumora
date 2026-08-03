import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import logo from "../../assets/logos/Logo_only.png";
import Input from "../../components/common/Input";
import authService from "../../services/authService";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {

        if (!email.trim()) {
            toast.error("Please enter your email.");
            return;
        }

        try {

            setLoading(true);

            await authService.forgotPassword({ email });

            toast.success("OTP sent successfully.");

            navigate('/verifyEmail',{state:{email:email,purpose:'forgotPassword'},});

        } catch (error) {

            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? "Failed to send OTP.");
            } else {
                toast.error("Failed to send OTP.");
            }

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="min-h-screen bg-[#111111] flex flex-col">

            {/* Logo */}

            <header className="pt-10">
                <img
                    src={logo}
                    alt="Lumora"
                    className="mx-auto w-24"
                />
            </header>

            {/* Content */}

            <main className="flex flex-1 items-center justify-center px-6">

                <div
                    className="
                        w-full
                        max-w-[440px]
                        rounded-2xl
                        border
                        border-[#2B2B2B]
                        bg-[#171717]
                        p-10
                    "
                >

                    <h1 className="text-3xl font-semibold text-primary">
                        Reset Password
                    </h1>

                    <p className="mt-2 text-sm text-secondary">
                        Enter your email to receive reset instructions.
                    </p>

                    <div className="mt-8">

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`
                            mt-8
                            w-full
                            rounded-lg
                            py-3
                            font-semibold
                            tracking-[0.18em]
                            transition-all
                            duration-300

                            ${
                                loading
                                    ? "cursor-not-allowed bg-[#353535] text-[#777]"
                                    : "bg-primary text-[#111111] hover:bg-[#E7BA64]"
                            }
                        `}
                    >
                        {loading
                            ? "SENDING..."
                            : "CONTINUE"}
                    </button>

                    <Link
                        to="/login"
                        className="
                            mt-6
                            block
                            text-center
                            text-xs
                            uppercase
                            tracking-[0.2em]
                            text-secondary
                            transition-colors
                            hover:text-primary
                        "
                    >
                        Back to Sign In
                    </Link>

                </div>

            </main>

        </div>
    );
};

export default ForgotPasswordPage;
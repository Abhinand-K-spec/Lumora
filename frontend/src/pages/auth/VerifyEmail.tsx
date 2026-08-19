import { useLocation, useNavigate } from "react-router-dom";
import { AtSign } from "lucide-react";
import logo from "../../assets/logos/Logo_only.png";
import OtpInput from "../../components/common/OtpInput";
import { useEffect, useState } from "react";
import authService from "../../services/authService";
import { toast } from "sonner";

const VerifyEmailPage = () => {
  const { state } = useLocation();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(40);

  const navigate = useNavigate();

  const email = state?.email;

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Enter a valid otp");
      return;
    }

    try {
      if (state?.purpose === "register") {
        setLoading(true);

        await authService.verifyEmail({ email, otp: otpValue });
        toast.success("Email verified successfully, please log in to continue");

        navigate("/login");
      } else {
        setLoading(true);

        await authService.verifyResetOtp({ email, otp: otpValue });

        navigate("/resetPassword", { state: { email, otp: otpValue } });
      }
    } catch (error) {
      toast.error("verification failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    try {
      await authService.resendOtp({ email });

      toast.success("A new OTP has been sent.");

      setTimeLeft(40);
    } catch (error) {
      toast.error("Resend OTP failed");

      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* ---------------- Header ---------------- */}

      <header className="px-10 pt-8">
        <img src={logo} alt="Lumora" className="w-14" />
      </header>

      {/* ---------------- Main ---------------- */}

      <main className="flex-1 flex items-center justify-center">
        <div
          className="
                        w-[560px]
                        rounded-3xl
                        border
                        border-[#2B2B2B]
                        bg-[#171717]
                        px-14
                        py-14
                    "
        >
          {/* Title */}

          <h1 className="text-center text-primary text-5xl font-semibold">
            Verify Identity
          </h1>

          <p className="text-center text-secondary mt-4 text-lg">
            Verify your identity to continue.
          </p>

          {/* Email */}

          <p className="mt-10 text-center tracking-[0.35em] text-xs text-secondary">
            SENDING CODE TO
          </p>

          <div className="flex justify-center mt-4">
            <div
              className="
                                flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-[#353535]
                                bg-[#1E1E1E]
                                px-6
                                py-3
                            "
            >
              <AtSign size={18} className="text-secondary" />

              <span className="text-white">{email}</span>
            </div>
          </div>

          {/* OTP Placeholder */}

          <OtpInput value={otp} onChange={setOtp} />

          {/* Timer */}

          <div className="mt-10 flex justify-center">
            <p className="text-secondary">
              ⏱ {timeLeft.toString().padStart(2, "0")}
            </p>
          </div>

          {/* Resend */}

          <div className="mt-3 text-center">
            <button
              onClick={handleResend}
              disabled={timeLeft > 0}
              className={`
                            mt-3
                            text-sm
                            uppercase
                            tracking-[0.25em]
                            transition-colors
                            ${
                              timeLeft > 0
                                ? "cursor-not-allowed text-[#686868]"
                                : "text-primary hover:text-[#E7BA64]"
                            }
                        `}
            >
              Resend Code
            </button>
          </div>

          {/* Verify Button */}

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="
                            mt-10
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-3
                            rounded-xl
                            bg-primary
                            py-4
                            font-semibold
                            tracking-[0.25em]
                            text-[#111111]
                            transition
                            hover:bg-[#E7BA64]
                        "
          >
            {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;

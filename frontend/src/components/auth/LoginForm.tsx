import Input from "../common/Input";
import Button from "../common/Button";

import { Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/auth/loginSchema";

import { toast } from "sonner";
import axios from "axios";
import useAuth from "../../hooks/useAuth";

const LoginForm = () => {
  const { login } = useAuth();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);

      toast.success("User logged in successfully");

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("something went wrong");
      }
    }
  };

  return (
    <div className="flex w-1/2 items-center justify-center p-10 text-white">
      <div className="w-full max-w-xl space-y-5 rounded-2xl border border-[#2B2B2B] bg-[#171717] p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-5xl text-primary">Welcome Back</h1>

          <p className="mt-3 text-text-secondary">
            Log in to your Lumora account.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="example@domain.com"
            icon={<Mail size={20} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            icon={<Lock size={20} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              to="/forgotPassword"
              className="text-sm text-primary transition hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit">Log In</Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-border" />
          <span className="mx-4 text-sm text-text-secondary">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() =>
            (window.location.href = "http://localhost:3000/api/auth/google")
          }
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-border
            bg-card
            py-3
            font-medium
            text-text
            transition
            hover:bg-neutral-800
          "
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            New to Lumora?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary transition hover:underline"
            >
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

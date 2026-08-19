import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Mail, Lock } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import RegisterHero from "../../components/auth/RegisterHero";
import useAdminAuth from "../../hooks/useAdminAuth";
import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/auth/loginSchema";

const AdminLogin = () => {
  const { login } = useAdminAuth();
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
      toast.success("Admin logged in successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid credentials");
      } else {
        toast.error("something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <RegisterHero />

        <div className="flex w-1/2 items-center justify-center p-10 text-white">
          <div className="w-full max-w-xl space-y-5 rounded-2xl border border-[#2B2B2B] bg-[#171717] p-5 shadow-2xl">
            {/* Header */}
            <div className="mb-10">
              <h1 className="font-heading text-5xl text-primary">
                Admin Console
              </h1>
              <p className="mt-3 text-text-secondary">
                Log in to Lumora administration dashboard.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="admin@domain.com"
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

              <Button type="submit">Log In as Admin</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

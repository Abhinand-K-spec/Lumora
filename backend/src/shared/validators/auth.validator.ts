import { z } from "zod";
import { userRole } from "../enums/UserRole.js";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must contain an uppercase letter, lowercase letter, and a number"
  );

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name must be less than 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  role: z.enum([userRole.USER, userRole.PHOTOGRAPHER]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().min(1, "OTP is required"),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().min(1, "OTP is required"),
  password: passwordSchema,
});

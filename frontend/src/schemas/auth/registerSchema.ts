import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(30, "Full name must be less than 30 characters"),

    email: z.string().email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain an uppercase letter, lowercase letter, and a number",
      ),

    confirmPassword: z.string(),

    role: z.enum(["USER", "PHOTOGRAPHER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

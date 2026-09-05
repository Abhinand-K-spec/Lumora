import { z } from "zod";

export const profileSchema = z.object({
  name: z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Name can only contain letters, spaces, apostrophes, and hyphens"
  ),
  phone: z
    .string()
    .min(10, "Phone number must be  10 digits")
    .max(10, "Phone number must be  10 digits")
    .regex(/^\+?[0-9]+$/, "Please enter a valid phone number"),
  profilePhoto: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

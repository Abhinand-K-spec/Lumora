import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name must be less than 30 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be  10 digits")
    .max(10, "Phone number must be  10 digits")
    .regex(/^\+?[0-9]+$/, "Please enter a valid phone number"),
  profilePhoto: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

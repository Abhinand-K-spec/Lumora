import { z } from "zod";

export const photographerEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Name can only contain letters, spaces, apostrophes, and hyphens",
    ),

  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const cleaned = val.replace(/[\s-]/g, "");
        return /^(?:\+?91)?[6-9]\d{9}$/.test(cleaned);
      },
      {
        message:
          "Please enter a valid 10-digit mobile number (e.g., 9876543210 or +91 98765 43210)",
      },
    )
    .optional(),

  location: z.string().trim().min(1, "Please select your base location"),

  instagramUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/i.test(
          val,
        );
      },
      {
        message:
          "Please enter a valid Instagram URL (e.g., https://instagram.com/yourhandle)",
      },
    )
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1000 characters")
    .refine((val) => !val || val.length >= 10, {
      message: "Bio must be at least 10 characters long if provided",
    })
    .optional(),

  specialities: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Speciality must be at least 2 characters")
        .max(40),
    )
    .max(10, "You can select up to 10 specialities")
    .default([]),

  languages: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Language must be at least 2 characters")
        .max(30),
    )
    .max(10, "You can add up to 10 languages")
    .default([]),

  equipment: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Gear name must be at least 2 characters")
        .max(60),
    )
    .max(20, "You can add up to 20 gear items")
    .default([]),

  serviceRegions: z
    .array(z.string().trim().min(2))
    .max(20, "You can add up to 20 service regions")
    .default([]),
});

export type PhotographerEditFormData = z.infer<typeof photographerEditSchema>;

import { z } from "zod";

export const editPhotographerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Name can only contain letters, spaces, apostrophes, and hyphens",
    )
    .optional(),

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
          "Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 98765 43210)",
      },
    )
    .optional(),

  location: z.string().trim().optional(),

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
    .optional(),

  profilePhoto: z.string().optional(),
  coverPhoto: z.string().optional(),

  specialities: z
    .array(z.string().trim().min(2).max(40))
    .max(10, "Maximum 10 specialities allowed")
    .optional(),

  languages: z
    .array(z.string().trim().min(2).max(30))
    .max(10, "Maximum 10 languages allowed")
    .optional(),

  equipment: z
    .array(z.string().trim().min(2).max(60))
    .max(20, "Maximum 20 equipment items allowed")
    .optional(),

  serviceRegions: z
    .array(z.string().trim().min(2))
    .max(20, "Maximum 20 service regions allowed")
    .optional(),
});

export const reviewApprovalRequestSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"], {
      message: "Status must be APPROVED or REJECTED",
    }),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED") {
        return !!data.rejectionReason && data.rejectionReason.length >= 5;
      }
      return true;
    },
    {
      message:
        "A rejection reason of at least 5 characters is required when rejecting an application.",
      path: ["rejectionReason"],
    },
  );

import { z } from "zod";

export const createEventSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  name: z
    .string()
    .trim()
    .min(1, "Event name is required")
    .max(150, "Event name must be at most 150 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
});

export const updateEventSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Event name cannot be empty")
      .max(150, "Event name must be at most 150 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
    status: z
      .enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"])
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    { message: "At least one field is required to update" }
  );

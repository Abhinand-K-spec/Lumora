import { z } from "zod";

export const subEventSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid event date is required",
  }),
  location: z.string().min(2, "Event location/venue is required"),
});

export const createBookingSchema = z.object({
  photographerId: z.string().min(1, "Photographer ID is required"),
  packageId: z.string().optional(),
  events: z
    .array(subEventSchema)
    .min(1, "At least one event with a date is required"),
  notes: z.string().max(1000).optional(),
});
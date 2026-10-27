import { z } from "zod";
export const createBookingSchema = z.object({
  body: z.object({
    photographerId: z.string().min(1, "Photographer ID is required"),
    packageId: z.string().optional(),
    eventType: z.string().min(2, "Event type is required"),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid event date is required",
    }),
    location: z.string().optional(),
    notes: z.string().max(1000).optional(),
    totalPrice: z.number().nonnegative().optional(),
  }),
});
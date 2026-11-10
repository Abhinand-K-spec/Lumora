import { z } from "zod";

export const blockAvailabilitySchema = z
  .object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    reason: z.string().trim().max(250).optional(),
  })
  .refine(
    (data) => data.startDate <= data.endDate,
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export const getCalendarSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});
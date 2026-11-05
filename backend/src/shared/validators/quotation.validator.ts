import { z } from "zod";

export const createQuotationSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Item name is required"),
        description: z.string().trim().optional(),
        quantity: z.number().positive("Quantity must be greater than 0"),
        unitPrice: z.number().nonnegative("Unit price cannot be negative"),
      }),
    )
    .min(1, "At least one quotation item is required"),

  discount: z
    .number()
    .nonnegative("Discount cannot be negative")
    .optional()
    .default(0),

  tax: z
    .number()
    .nonnegative("Tax cannot be negative")
    .optional()
    .default(0),

  advanceAmount: z
    .number()
    .nonnegative("Advance amount cannot be negative"),

  validUntil: z.iso.datetime({
    message: "A valid quotation expiry date is required",
  }),

  notes: z.string().trim().optional(),
});

export type CreateQuotationDTO = z.infer<
  typeof createQuotationSchema
>;
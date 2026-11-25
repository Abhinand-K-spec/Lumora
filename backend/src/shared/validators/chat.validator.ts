
import { z } from "zod";

// MongoDB ObjectId validation
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// Create conversation
export const createConversationSchema = z.object({
  photographerUserId: objectIdSchema,
});

// Send message
export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),

  type: z.enum(["TEXT", "IMAGE", "FILE"]).default("TEXT"),
});

// Conversation route parameters
export const conversationParamsSchema = z.object({
  conversationId: objectIdSchema,
});

// Message pagination query
export const messageQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),

  cursor: objectIdSchema.optional(),
});

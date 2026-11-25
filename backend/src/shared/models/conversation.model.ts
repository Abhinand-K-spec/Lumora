import mongoose, { Schema } from "mongoose";
import type { IConversation } from "../interfaces/IConversation";

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    photographerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index(
  { userId: 1, photographerId: 1 },
  { unique: true },
);

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);

export default Conversation;

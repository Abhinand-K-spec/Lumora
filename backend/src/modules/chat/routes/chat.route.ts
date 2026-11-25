import Router from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware";

import { ChatService } from "../services/ChatService";
import { ChatController } from "../controllers/conversationController";
import MessageRepository from "../repositories/MessageRepository";
import ConversationRepository from "../repositories/ConversationRepository";

const router = Router();

// Repositories
const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();

// Service
const chatService = new ChatService(
  conversationRepository,
  messageRepository
);

const chatController = new ChatController(chatService);

// Create or retrieve conversation
router.post(
  "/conversations",
  authenticate,
  chatController.createConversation.bind(chatController)
);

// Get customer conversations
router.get(
  "/conversations/user",
  authenticate,
  chatController.getUserConversations.bind(chatController)
);

// Get photographer conversations
router.get(
  "/conversations/photographer",
  authenticate,
  chatController.getPhotographerConversations.bind(chatController)
);

// Get conversation messages
router.get(
  "/conversations/:conversationId/messages",
  authenticate,
  chatController.getMessages.bind(chatController)
);

// Send message
router.post(
  "/conversations/:conversationId/messages",
  authenticate,
  chatController.sendMessage.bind(chatController)
);

// Mark messages as read
router.patch(
  "/conversations/:conversationId/read",
  authenticate,
  chatController.markMessagesAsRead.bind(chatController)
);

export default router;

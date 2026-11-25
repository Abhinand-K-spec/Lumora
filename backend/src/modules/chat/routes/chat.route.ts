import Router from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware.js";
import { validate } from "../../../shared/middlewares/validation.middleware.js";
import {
  createConversationSchema,
  sendMessageSchema,
} from "../../../shared/validators/chat.validator.js";
import { ChatService } from "../services/ChatService.js";
import { ChatController } from "../controllers/conversationController.js";
import MessageRepository from "../repositories/MessageRepository.js";
import ConversationRepository from "../repositories/ConversationRepository.js";

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
  validate(createConversationSchema),
  chatController.createConversation.bind(chatController)
);

// Get conversations for the authenticated user (unified)
router.get(
  "/conversations",
  authenticate,
  chatController.getConversations.bind(chatController)
);

// Get customer conversations (backwards compatible)
router.get(
  "/conversations/user",
  authenticate,
  chatController.getUserConversations.bind(chatController)
);

// Get photographer conversations (backwards compatible)
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
  validate(sendMessageSchema),
  chatController.sendMessage.bind(chatController)
);

// Mark messages as read
router.patch(
  "/conversations/:conversationId/read",
  authenticate,
  chatController.markMessagesAsRead.bind(chatController)
);

export default router;

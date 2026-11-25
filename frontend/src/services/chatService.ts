import api from "../api/axios";

export interface ParticipantSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
  phone?: string;
}

export interface ConversationItem {
  _id: string;
  userId: string | ParticipantSummary;
  photographerId: string | ParticipantSummary;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  otherParticipant?: ParticipantSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE";
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
  tempId?: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

const chatService = {
  async getConversations(): Promise<ConversationItem[]> {
    const response = await api.get("/chat/conversations");
    return response.data.data;
  },

  async getOrCreateConversation(
    targetUserId: string
  ): Promise<ConversationItem> {
    const response = await api.post("/chat/conversations", {
      targetUserId,
    });
    return response.data.data;
  },

  async getMessages(
    conversationId: string,
    limit = 30,
    cursor?: string
  ): Promise<MessagesResponse> {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { limit, cursor },
      }
    );
    const data = response.data.data;
    // In case backend returned array directly or paginated object
    if (Array.isArray(data)) {
      return {
        messages: data,
        nextCursor: null,
        hasMore: false,
      };
    }
    return data;
  },

  async sendMessage(
    conversationId: string,
    content: string,
    type: "TEXT" | "IMAGE" | "FILE" = "TEXT"
  ): Promise<ChatMessage> {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      {
        content,
        type,
      }
    );
    return response.data.data;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.patch(`/chat/conversations/${conversationId}/read`);
  },
};

export default chatService;

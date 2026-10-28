
import api from "../api/axios";

export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_ACCEPTED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "QUOTATION_RECEIVED"
  | "QUOTATION_ACCEPTED"
  | "QUOTATION_REJECTED"
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "PHOTOGRAPHER_FOLLOWED"
  | "PROFILE_APPROVED"
  | "PROFILE_REJECTED";

export interface NotificationItem {
  _id: string;
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: "BOOKING" | "QUOTATION" | "POST" | "PROFILE";
  resourceId?: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPage {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

const notificationService = {
  async getNotifications(
    page = 1,
    limit = 20
  ): Promise<NotificationPage> {
    const response = await api.get("/notifications", {
      params: { page, limit },
    });

    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread-count");

    return response.data.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch(
      `/notifications/${id}/read`
    );

    return response.data.data;
  },

  async markAllAsRead(): Promise<number> {
    const response = await api.patch(
      "/notifications/read-all"
    );

    return response.data.data;
  },
};

export default notificationService;

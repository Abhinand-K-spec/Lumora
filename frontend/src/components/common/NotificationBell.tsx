
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import notificationService, {
  type NotificationItem,
} from "../../services/notificationService";

export default function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);

    try {
      const result = await notificationService.getNotifications(1, 10);

      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch {
      toast.error("Unable to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    try {
      await notificationService.markAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      toast.error("Unable to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Unable to update notifications");
    }
  };

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    try {
      await handleMarkAsRead(notification);

      if (notification.resourceType === "BOOKING" && notification.resourceId) {
        navigate(`/bookings/${notification.resourceId}`);
      } else if (
        notification.resourceType === "POST" &&
        notification.resourceId
      ) {
        navigate(`/posts/${notification.resourceId}`);
      } else if (
        notification.resourceType === "QUOTATION" &&
        notification.resourceId
      ) {
        navigate(`/quotations/${notification.resourceId}`);
      }

      setIsOpen(false);
    } catch {
      toast.error("Unable to open notification");
    }
  };


  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
        className="relative rounded-full p-2 text-text-primary transition-colors hover:bg-surface"
      >
        <Bell size={22} />
  
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
  
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-neutral text-text-primary shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-surface p-4">
            <div>
              <h3 className="font-semibold text-text-primary">
                Notifications
              </h3>
              <p className="text-xs text-text-secondary">
                {unreadCount} unread
              </p>
            </div>
  
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-secondary disabled:opacity-40"
            >
              <CheckCheck size={16} />
              Read all
            </button>
          </div>
  
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <LoaderCircle className="animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-text-secondary">
                No notifications yet.
              </p>
            ) : (
              notifications
              .filter((notification) => !notification.isRead)
              .map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className={`flex w-full gap-3 border-b border-border p-4 text-left transition-colors hover:bg-card ${
                    notification.isRead
                      ? "bg-neutral"
                      : "bg-surface"
                  }`}
                >
                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                      notification.isRead
                        ? "bg-text-secondary/40"
                        : "bg-primary"
                    }`}
                  />
  
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-text-primary">
                      {notification.title}
                    </span>
  
                    <span className="mt-1 block text-sm text-text-secondary">
                      {notification.message}
                    </span>
  
                    <span className="mt-2 block text-xs text-text-secondary/70">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}  
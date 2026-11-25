import { useState, useEffect, useCallback, useRef } from "react";
import useSocket from "./useSocket";
import useAuth from "./useAuth";
import chatService, { type ChatMessage } from "../services/chatService";

export const useChat = (activeConversationId: string | null) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const currentUserId = user?._id || user?.id;
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial message history when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    chatService
      .getMessages(activeConversationId, 50)
      .then((res) => {
        if (isMounted) {
          // Backend returns newest first; reverse for chronological chat display (oldest top, newest bottom)
          const chronological = [...res.messages].reverse();
          setMessages(chronological);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    // Mark messages as read when opening conversation
    chatService.markAsRead(activeConversationId).catch((err) => {
      console.warn("Failed to mark messages as read:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Handle socket rooms & real-time events
  useEffect(() => {
    if (!activeConversationId || !isConnected) return;

    socket.emit("conversation:join", activeConversationId);

    const handleNewMessage = (newMsg: ChatMessage) => {
      if (newMsg.conversationId !== activeConversationId) return;

      setMessages((prev) => {
        // If message with same DB _id already exists, don't duplicate
        if (prev.some((m) => m._id === newMsg._id)) {
          return prev;
        }

        // If this message was sent by current user, replace matching pending optimistic message
        if (newMsg.senderId === currentUserId) {
          const optimisticIndex = prev.findIndex(
            (m) => m.tempId && m.content === newMsg.content
          );
          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = newMsg;
            return next;
          }
        }

        return [...prev, newMsg];
      });

      // If received from the other party while in this room, mark as read
      if (newMsg.senderId !== currentUserId) {
        chatService.markAsRead(activeConversationId).catch(() => {});
      }
    };

    const handleMessagesRead = (payload: {
      conversationId: string;
      readerId: string;
    }) => {
      if (payload.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId ? { ...m, isRead: true } : m
          )
        );
      }
    };

    const handleTypingStart = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (
        payload.conversationId === activeConversationId &&
        payload.userId !== currentUserId
      ) {
        setIsOtherTyping(true);
      }
    };

    const handleTypingStop = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (
        payload.conversationId === activeConversationId &&
        payload.userId !== currentUserId
      ) {
        setIsOtherTyping(false);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessagesRead);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.emit("conversation:leave", activeConversationId);
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessagesRead);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      setIsOtherTyping(false);
    };
  }, [activeConversationId, isConnected, currentUserId, socket]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, type: "TEXT" | "IMAGE" | "FILE" = "TEXT") => {
      if (!content.trim() || !activeConversationId || !currentUserId) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        _id: tempId,
        conversationId: activeConversationId,
        senderId: currentUserId,
        content: content.trim(),
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
        tempId,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setSending(true);

      // Stop typing indicator when sent
      if (isConnected) {
        socket.emit("typing:stop", { conversationId: activeConversationId });
      }

      try {
        const sentMessage = await chatService.sendMessage(
          activeConversationId,
          content,
          type
        );
        setMessages((prev) => {
          // If socket already replaced or added it
          if (prev.some((m) => m._id === sentMessage._id)) {
            return prev.filter((m) => m.tempId !== tempId);
          }
          return prev.map((m) => (m.tempId === tempId ? sentMessage : m));
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        // Remove failed optimistic message or mark error
        setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, currentUserId, isConnected, socket]
  );

  // Trigger typing indicator with automatic debounce
  const notifyTyping = useCallback(() => {
    if (!activeConversationId || !isConnected) return;

    socket.emit("typing:start", { conversationId: activeConversationId });

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeConversationId });
    }, 2000);
  }, [activeConversationId, isConnected, socket]);

  return {
    messages,
    loadingMessages,
    isOtherTyping,
    sending,
    sendMessage,
    notifyTyping,
  };
};

export default useChat;

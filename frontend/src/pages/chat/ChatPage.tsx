import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useSocket from "../../hooks/useSocket";
import useChat from "../../hooks/useChat";
import chatService, {
  type ConversationItem,
  type ParticipantSummary,
} from "../../services/chatService";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import MessageInput from "../../components/chat/MessageInput";

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingConversations, setLoadingConversations] =
    useState<boolean>(true);

  const currentUserId = user?._id || user?.id;

  // Real-time chat hook for the active conversation
  const {
    messages,
    loadingMessages,
    isOtherTyping,
    sendMessage,
    notifyTyping,
    sending,
  } = useChat(activeConversationId);

  // Load conversations on mount
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);
      return data;
    } catch (err) {
      console.error("Failed to load conversations:", err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations().then((loaded) => {
      // If a target user was passed in query param (e.g. ?userId=...)
      const targetUserId = searchParams.get("userId");
      if (targetUserId) {
        chatService
          .getOrCreateConversation(targetUserId)
          .then((conv) => {
            setActiveConversationId(conv._id);
            // Append or move to top if not present
            setConversations((prev) => {
              const exists = prev.some((c) => c._id === conv._id);
              if (exists) return prev;
              return [conv, ...prev];
            });
          })
          .catch((err) => {
            console.error("Failed to initiate conversation with user:", err);
          });
      } else if (loaded.length > 0) {
        // Default to the most recent conversation on desktop
        setActiveConversationId((prev) => prev || loaded[0]._id);
      }
    });
  }, [fetchConversations, searchParams]);

  // Listen for real-time conversation updates (new messages while on this page)
  useEffect(() => {
    if (!isConnected) return;

    const handleConversationUpdated = (payload: {
      conversationId: string;
      lastMessage: string;
      lastMessageAt: string;
      senderId: string;
    }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === payload.conversationId);
        if (index === -1) {
          // If conversation wasn't in list yet, refresh
          fetchConversations();
          return prev;
        }

        const updated = [...prev];
        const currentConv = updated[index];
        const isCurrentActive = currentConv._id === activeConversationId;

        const newUnread =
          payload.senderId !== currentUserId && !isCurrentActive
            ? currentConv.unreadCount + 1
            : 0;

        const updatedConv: ConversationItem = {
          ...currentConv,
          lastMessage: payload.lastMessage,
          lastMessageAt: payload.lastMessageAt,
          unreadCount: newUnread,
        };

        // Move active / updated conversation to top
        updated.splice(index, 1);
        return [updatedConv, ...updated];
      });
    };

    socket.on("conversation:updated", handleConversationUpdated);

    return () => {
      socket.off("conversation:updated", handleConversationUpdated);
    };
  }, [isConnected, socket, activeConversationId, currentUserId, fetchConversations]);

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    // Optimistically reset unread badge in list
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );

  const getOtherParticipant = (
    conv?: ConversationItem
  ): ParticipantSummary | undefined => {
    if (!conv) return undefined;
    if (conv.otherParticipant) return conv.otherParticipant;
    const u = conv.userId as ParticipantSummary;
    const p = conv.photographerId as ParticipantSummary;
    const uId = u?._id || (u as unknown as { id?: string })?.id;
    if (uId === currentUserId) return p;
    return u;
  };

  const otherParticipant = getOtherParticipant(activeConversation);

  return (
    <div className="flex h-full w-full overflow-hidden bg-black">
      {/* 1. Conversations Sidebar (Hidden on mobile if conversation is selected) */}
      <div
        className={`w-full md:w-80 lg:w-96 h-full flex-shrink-0 ${
          activeConversationId ? "hidden md:block" : "block"
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loadingConversations}
        />
      </div>

      {/* 2. Active Chat View */}
      <div
        className={`flex-1 h-full flex flex-col ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatWindow
          otherParticipant={otherParticipant}
          messages={messages}
          loadingMessages={loadingMessages}
          isOtherTyping={isOtherTyping}
          currentUserId={currentUserId}
          onBack={() => setActiveConversationId(null)}
        >
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={notifyTyping}
            disabled={!activeConversationId || sending}
          />
        </ChatWindow>
      </div>
    </div>
  );
};

export default ChatPage;

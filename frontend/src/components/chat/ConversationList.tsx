import React from "react";
import { Search, MessageSquare } from "lucide-react";
import type { ConversationItem, ParticipantSummary } from "../../services/chatService";

interface ConversationListProps {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
  searchQuery,
  onSearchChange,
  loading = false,
}) => {
  const getOtherParticipant = (
    conv: ConversationItem
  ): ParticipantSummary | undefined => {
    if (conv.otherParticipant) return conv.otherParticipant;
    const u = conv.userId as ParticipantSummary;
    const p = conv.photographerId as ParticipantSummary;
    const uId = u?._id || (u as unknown as { id?: string })?.id;
    if (uId === currentUserId) return p;
    return u;
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    const name = other?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[#0B0C0E] border-r border-border/20 select-none">
      {/* Header & Search */}
      <div className="p-4 border-b border-border/20">
        <h2 className="text-xl font-heading font-semibold text-text mb-3">
          Messages
        </h2>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900/60 border border-border/20 rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary p-4 text-center">
            <p className="text-xs">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary p-4 text-center">
            <MessageSquare size={32} className="opacity-30 mb-2" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = conv._id === activeConversationId;
            const hasUnread = conv.unreadCount > 0;

            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => onSelectConversation(conv._id)}
                className={`w-full text-left p-4 transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-neutral-900/40"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {other?.profilePhoto ? (
                      <img
                        src={other.profilePhoto}
                        alt={other.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{other?.name?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-sm font-medium text-text truncate">
                      {other?.name || "User"}
                    </span>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {formatTime(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? "text-text font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {conv.lastMessage || "Started conversation"}
                    </p>

                    {hasUnread && (
                      <span className="flex-shrink-0 bg-primary text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;

import React, { useEffect, useRef } from "react";
import { Check, CheckCheck, MessageSquare, ArrowLeft } from "lucide-react";
import type { ChatMessage, ParticipantSummary } from "../../services/chatService";

interface ChatWindowProps {
  otherParticipant?: ParticipantSummary;
  messages: ChatMessage[];
  loadingMessages: boolean;
  isOtherTyping: boolean;
  currentUserId?: string;
  onBack?: () => void;
  children: React.ReactNode; // Input area
}

const formatMessageTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  otherParticipant,
  messages,
  loadingMessages,
  isOtherTyping,
  currentUserId,
  onBack,
  children,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-black text-text-secondary p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-lg font-heading font-semibold text-text mb-1">
          Select a Conversation
        </h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Choose a conversation from the sidebar or start a new message to chat with your clients or photographers in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
      {/* Chat Top Header */}
      <div className="h-16 px-4 md:px-6 border-b border-border/20 bg-[#0B0C0E] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-1.5 text-text-secondary hover:text-text rounded-lg"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {otherParticipant.profilePhoto ? (
              <img
                src={otherParticipant.profilePhoto}
                alt={otherParticipant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{otherParticipant.name?.charAt(0).toUpperCase() || "U"}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text truncate">
              {otherParticipant.name}
            </h3>
            <p className="text-xs text-text-secondary truncate">
              {otherParticipant.role === "PHOTOGRAPHER"
                ? "Photographer"
                : "Client"}
            </p>
          </div>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full text-text-secondary text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-text-secondary text-xs select-none">
            <p>No messages yet.</p>
            <p className="mt-1">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const msgSenderId =
              typeof msg.senderId === "object" && msg.senderId !== null
                ? (msg.senderId as { _id?: string; id?: string })._id ||
                  (msg.senderId as { _id?: string; id?: string }).id
                : msg.senderId;
            const isMe = msgSenderId === currentUserId;

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                    isMe
                      ? "bg-primary/20 text-white border border-primary/30 rounded-tr-sm"
                      : "bg-[#14161A] text-text border border-border/20 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  <div
                    className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${
                      isMe ? "text-primary/70" : "text-text-secondary"
                    }`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMe && (
                      <span>
                        {msg.isRead ? (
                          <CheckCheck size={13} className="text-primary" />
                        ) : (
                          <Check size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isOtherTyping && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl rounded-tl-sm bg-[#14161A] border border-border/20 w-fit text-xs text-text-secondary animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
            <span className="ml-1 text-[11px] text-text-secondary">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area rendered as child */}
      <div className="p-3 md:p-4 bg-[#0B0C0E] border-t border-border/20">
        {children}
      </div>
    </div>
  );
};

export default ChatWindow;

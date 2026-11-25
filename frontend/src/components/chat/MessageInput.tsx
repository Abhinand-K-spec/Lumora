import React, { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onSendMessage(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
      <div className="flex-1 bg-neutral-900/60 border border-border/20 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
        <textarea
          rows={1}
          placeholder="Type your message..."
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-text placeholder:text-text-secondary/60 focus:outline-none resize-none max-h-32 leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary text-black font-bold flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        title="Send Message"
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default MessageInput;

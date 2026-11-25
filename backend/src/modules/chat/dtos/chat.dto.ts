import type { MessageType } from "../../../shared/interfaces/IMessage.js";

export interface CreateConversationDto {
  photographerUserId?: string;
  targetUserId?: string;
  participantId?: string;
}

export interface SendMessageDto {
  content: string;
  type?: MessageType;
}

export interface ParticipantSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
  phone?: string;
}

export interface ConversationResponseDto {
  _id: string;
  userId: string | ParticipantSummary;
  photographerId: string | ParticipantSummary;
  lastMessage?: string | undefined;
  lastMessageAt?: Date | undefined;
  unreadCount: number;
  otherParticipant?: ParticipantSummary | undefined;
  createdAt: Date;
  updatedAt: Date;
}

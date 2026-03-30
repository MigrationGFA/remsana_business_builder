/**
 * Chat – SME Web API client
 *
 * Uses the Engagement Service (VITE_ENGAGEMENT_API_URL, port 4000).
 * Requires Bearer token (SME).
 */

import { engagementApi, hasEngagementService } from './httpClient';

export { hasEngagementService };

export interface ChatConversation {
  id: string;
  ticket_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  is_admin: boolean;
  file_url?: string;
  read_at?: string;
  created_at: string;
}

export interface ConversationWithMessages extends ChatConversation {
  messages: ChatMessage[];
}

/**
 * List user's conversations
 */
export async function getConversations(): Promise<ChatConversation[]> {
  if (!hasEngagementService()) return [];
  try {
    const { data } = await engagementApi.get<ChatConversation[]>('/conversations');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return [];
  }
}

/**
 * Create or get existing conversation
 */
export async function createConversation(ticketId?: string): Promise<ChatConversation> {
  const { data } = await engagementApi.post<ChatConversation>('/conversations', {
    ...(ticketId ? { ticket_id: ticketId } : {}),
  });
  return data;
}

/**
 * Get conversation with messages
 */
export async function getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
  if (!hasEngagementService()) return null;
  try {
    const { data } = await engagementApi.get<ConversationWithMessages>(
      `/chat/conversations/${encodeURIComponent(conversationId)}`,
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    return null;
  }
}

/**
 * Send a text message
 */
export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  const { data } = await engagementApi.post<ChatMessage>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content, type: 'text' },
  );
  return data;
}

/**
 * Upload a file/image
 */
export async function uploadFile(conversationId: string, file: File): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await engagementApi.post<ChatMessage>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * Mark a message as read
 */
export async function markMessageRead(conversationId: string, messageId: string): Promise<void> {
  await engagementApi.patch(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/read`,
  );
}

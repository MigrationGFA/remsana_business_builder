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
    console.log('[Chat] ➡️ GET /chat/conversations');
    const { data } = await engagementApi.get<ChatConversation[]>('/chat/conversations');
    console.log('[Chat] ⬅️ GET /chat/conversations response:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return [];
  }
}

export async function createConversation(ticketId?: string): Promise<ChatConversation> {
  console.log('[Chat] ➡️ POST /chat/conversations', { ticketId });
  const { data } = await engagementApi.post<ChatConversation>('/chat/conversations', {
    ...(ticketId ? { ticket_id: ticketId } : {}),
  });
  console.log('[Chat] ⬅️ POST /chat/conversations response:', data);
  return data;
}

/**
 * Get conversation with messages
 */
export async function getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
  if (!hasEngagementService()) return null;
  try {
    console.log('[Chat] ➡️ GET /chat/conversations/' + conversationId);
    const { data } = await engagementApi.get<ConversationWithMessages>(
      `/chat/conversations/${encodeURIComponent(conversationId)}`,
    );
    console.log('[Chat] ⬅️ GET /chat/conversations/' + conversationId + ' response:', data);
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
  console.log('[Chat] ➡️ POST /chat/conversations/' + conversationId + '/messages', { content });
  const { data } = await engagementApi.post<ChatMessage>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content, type: 'text' },
  );
  console.log('[Chat] ⬅️ POST /chat/conversations/' + conversationId + '/messages response:', data);
  return data;
}

/**
 * Upload a file/image
 */
export async function uploadFile(conversationId: string, file: File): Promise<ChatMessage> {
  console.log('[Chat] ➡️ POST /chat/conversations/' + conversationId + '/upload (multipart)');
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await engagementApi.post<ChatMessage>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  console.log('[Chat] ⬅️ POST /chat/conversations/' + conversationId + '/upload response:', data);
  return data;
}

/**
 * Mark a message as read
 */
export async function markMessageRead(conversationId: string, messageId: string): Promise<void> {
  console.log('[Chat] ➡️ PATCH /chat/conversations/' + conversationId + '/messages/' + messageId + '/read');
  await engagementApi.patch(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/read`,
  );
  console.log('[Chat] ⬅️ PATCH mark read success');
}

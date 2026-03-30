/**
 * Chat – Admin API client
 *
 * Uses the Engagement Service (VITE_ENGAGEMENT_API_URL, port 4000).
 * Requires Bearer token (Insider/Admin).
 */

import { engagementInsiderApi, hasEngagementService } from './httpClient';

export { hasEngagementService };

import type { ChatConversation, ChatMessage, ConversationWithMessages } from './chatApi';

export type { ChatConversation, ChatMessage, ConversationWithMessages };

/**
 * List all conversations (admin view)
 */
export async function getAdminConversations(): Promise<ChatConversation[]> {
  if (!hasEngagementService()) return [];
  try {
    const { data } = await engagementInsiderApi.get<ChatConversation[]>('/chat/admin/conversations');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch admin conversations:', error);
    return [];
  }
}

/**
 * Get conversation with messages (admin view)
 */
export async function getAdminConversation(conversationId: string): Promise<ConversationWithMessages | null> {
  if (!hasEngagementService()) return null;
  try {
    const { data } = await engagementInsiderApi.get<ConversationWithMessages>(
      `/chat/admin/conversations/${encodeURIComponent(conversationId)}`,
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch admin conversation:', error);
    return null;
  }
}

/**
 * Send admin reply
 */
export async function sendAdminMessage(conversationId: string, content: string): Promise<ChatMessage> {
  const { data } = await engagementInsiderApi.post<ChatMessage>(
    `/chat/admin/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content, type: 'text' },
  );
  return data;
}

/**
 * Upload file (admin)
 */
export async function uploadAdminFile(conversationId: string, file: File): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await engagementInsiderApi.post<ChatMessage>(
    `/chat/admin/conversations/${encodeURIComponent(conversationId)}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * Mark user message as read (admin)
 */
export async function markAdminMessageRead(conversationId: string, messageId: string): Promise<void> {
  await engagementInsiderApi.patch(
    `/chat/admin/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/read`,
  );
}

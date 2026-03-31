/**
 * Support Tickets – SME Web API client
 *
 * Uses the Engagement Service (VITE_ENGAGEMENT_API_URL, port 4000).
 * Requires Bearer token (SME).
 */

import { engagementApi, hasEngagementService } from './httpClient';

export { hasEngagementService };

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  message: string;
  user_name?: string;
  is_admin: boolean;
  created_at: string;
}

export interface TicketWithReplies extends Ticket {
  replies: TicketReply[];
}

/**
 * List tickets for the current user
 */
export async function getMyTickets(): Promise<Ticket[]> {
  if (!hasEngagementService()) return [];
  try {
    console.log('[Ticket] ➡️ GET /tickets');
    const { data } = await engagementApi.get<Ticket[]>('/tickets');
    console.log('[Ticket] ⬅️ GET /tickets response:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return [];
  }
}

/**
 * Create a new support ticket
 */
export async function createTicket(payload: {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  user_name?: string;
}): Promise<Ticket> {
  console.log('[Ticket] ➡️ POST /tickets', payload);
  const { data } = await engagementApi.post<Ticket>('/tickets', payload);
  console.log('[Ticket] ⬅️ POST /tickets response:', data);
  return data;
}

/**
 * Get ticket with replies
 */
export async function getTicket(ticketId: string): Promise<TicketWithReplies | null> {
  if (!hasEngagementService()) return null;
  try {
    console.log('[Ticket] ➡️ GET /tickets/' + ticketId);
    const { data } = await engagementApi.get<TicketWithReplies>(
      `/tickets/${encodeURIComponent(ticketId)}`,
    );
    console.log('[Ticket] ⬅️ GET /tickets/' + ticketId + ' response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    return null;
  }
}

/**
 * Add a reply to a ticket
 */
export async function addTicketReply(ticketId: string, payload: {
  message: string;
  user_name?: string;
}): Promise<TicketReply> {
  console.log('[Ticket] ➡️ POST /tickets/' + ticketId + '/replies', payload);
  const { data } = await engagementApi.post<TicketReply>(
    `/tickets/${encodeURIComponent(ticketId)}/replies`,
    payload,
  );
  console.log('[Ticket] ⬅️ POST /tickets/' + ticketId + '/replies response:', data);
  return data;
}

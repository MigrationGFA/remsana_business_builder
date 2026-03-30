/**
 * Support Tickets – Admin API client
 *
 * Uses the Engagement Service (VITE_ENGAGEMENT_API_URL, port 4000).
 * Requires Bearer token (Insider/Admin).
 */

import { engagementInsiderApi, hasEngagementService } from './httpClient';

export { hasEngagementService };

import type { Ticket, TicketReply, TicketWithReplies } from './ticketApi';

export type { Ticket, TicketReply, TicketWithReplies };

/**
 * List all tickets (admin view)
 */
export async function getAdminTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}): Promise<{ data: Ticket[]; pagination?: any }> {
  if (!hasEngagementService()) return { data: [] };
  try {
    const { data } = await engagementInsiderApi.get('/admin/tickets', { params });
    return {
      data: Array.isArray(data.data ?? data) ? (data.data ?? data) : [],
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch admin tickets:', error);
    return { data: [] };
  }
}

/**
 * Get ticket with replies (admin view)
 */
export async function getAdminTicket(ticketId: string): Promise<TicketWithReplies | null> {
  if (!hasEngagementService()) return null;
  try {
    const { data } = await engagementInsiderApi.get<TicketWithReplies>(
      `/admin/tickets/${encodeURIComponent(ticketId)}`,
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch admin ticket:', error);
    return null;
  }
}

/**
 * Update ticket status/priority (admin)
 */
export async function updateAdminTicket(ticketId: string, payload: {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
}): Promise<Ticket> {
  const { data } = await engagementInsiderApi.patch<Ticket>(
    `/admin/tickets/${encodeURIComponent(ticketId)}`,
    payload,
  );
  return data;
}

/**
 * Add admin reply to ticket
 */
export async function addAdminTicketReply(ticketId: string, payload: {
  message: string;
}): Promise<TicketReply> {
  const { data } = await engagementInsiderApi.post<TicketReply>(
    `/admin/tickets/${encodeURIComponent(ticketId)}/replies`,
    payload,
  );
  return data;
}

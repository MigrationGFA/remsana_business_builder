import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageCircle, Clock, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Alert } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getMyTickets, createTicket, getTicket, addTicketReply, hasEngagementService } from '../api/ticketApi';
import type { Ticket, TicketWithReplies } from '../api/ticketApi';

type View = 'list' | 'detail' | 'create';

export default function SupportPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Reply
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    const data = await getMyTickets();
    setTickets(data);
    setLoading(false);
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createTicket({ subject, message, priority });
      setSubject('');
      setMessage('');
      setPriority('medium');
      setView('list');
      await loadTickets();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    setLoading(true);
    const data = await getTicket(ticketId);
    if (data) {
      setSelectedTicket(data);
      setView('detail');
    }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSubmitting(true);
    try {
      await addTicketReply(selectedTicket.id, { message: replyText });
      setReplyText('');
      // Reload ticket
      const updated = await getTicket(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'closed': return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const statusLabel = (status: string) => status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!hasEngagementService()) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-[#6B7C7C] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1F2121] mb-2">Support Not Available</h2>
            <p className="text-[#6B7C7C] mb-4">Support service is not configured. Please contact your administrator.</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#6B7C7C]/20 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => view === 'list' ? navigate('/dashboard') : setView('list')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2121]" />
          </button>
          <img src={remsanaIcon} alt="Remsana" className="h-8 w-8" />
          <h1 className="text-lg font-semibold text-[#1F2121]">
            {view === 'create' ? 'New Ticket' : view === 'detail' ? 'Ticket Detail' : 'Support'}
          </h1>
          {view === 'list' && (
            <Button size="sm" className="ml-auto" onClick={() => setView('create')}>
              <Plus className="w-4 h-4 mr-1" /> New Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {error && <Alert variant="error" message={error} dismissible onDismiss={() => setError('')} />}

        {/* LIST VIEW */}
        {view === 'list' && (
          loading ? (
            <div className="text-center py-12 text-[#6B7C7C]">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#6B7C7C] mx-auto mb-4" />
                <p className="text-[#6B7C7C] mb-4">No support tickets yet</p>
                <Button onClick={() => setView('create')}>Create Your First Ticket</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewTicket(t.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {statusIcon(t.status)}
                          <span className="font-medium text-[#1F2121]">{t.subject}</span>
                        </div>
                        <p className="text-sm text-[#6B7C7C] line-clamp-1">{t.message}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span className="text-xs text-[#6B7C7C]">{statusLabel(t.status)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* CREATE VIEW */}
        {view === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2121] mb-1">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2121] mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail…"
                  rows={5}
                  className="w-full border border-[#6B7C7C]/30 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2121] mb-1">Priority</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        priority === p
                          ? 'border-[#1C1C8B] bg-[#1C1C8B]/5 text-[#1C1C8B]'
                          : 'border-[#6B7C7C]/30 text-[#6B7C7C] hover:border-[#1C1C8B]/50'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setView('list')} className="flex-1">Cancel</Button>
                <Button onClick={handleCreateTicket} disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && selectedTicket && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {statusIcon(selectedTicket.status)}
                  <h2 className="text-lg font-semibold text-[#1F2121]">{selectedTicket.subject}</h2>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className="text-xs text-[#6B7C7C]">{statusLabel(selectedTicket.status)}</span>
                </div>
                <p className="text-sm text-[#1F2121]">{selectedTicket.message}</p>
                <p className="text-xs text-[#6B7C7C] mt-2">
                  Created {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Replies */}
            {selectedTicket.replies?.length > 0 && (
              <div className="space-y-3">
                {selectedTicket.replies.map((r) => (
                  <Card key={r.id} className={r.is_admin ? 'border-l-4 border-l-[#1C1C8B]' : ''}>
                    <CardContent className="p-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-[#1F2121]">
                          {r.is_admin ? 'Support Agent' : r.user_name || 'You'}
                        </span>
                        <span className="text-xs text-[#6B7C7C]">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#1F2121]">{r.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Reply input */}
            {selectedTicket.status !== 'closed' && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply…"
                      rows={2}
                      className="flex-1 border border-[#6B7C7C]/30 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]/50"
                    />
                    <Button onClick={handleReply} disabled={submitting || !replyText.trim()} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

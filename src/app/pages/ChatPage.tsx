import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MessageCircle } from 'lucide-react';
import { Card, CardContent, Button } from '../components/remsana';
import remsanaIcon from '../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import {
  getConversations,
  createConversation,
  getConversation,
  sendMessage,
  uploadFile,
  markMessageRead,
  hasEngagementService,
} from '../api/chatApi';
import type { ChatConversation, ChatMessage } from '../api/chatApi';

type View = 'list' | 'conversation';

export default function ChatPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('list');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadConversations();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds when viewing a conversation
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (view === 'conversation' && activeConversationId) {
      pollRef.current = setInterval(async () => {
        const conv = await getConversation(activeConversationId);
        if (conv) setMessages(conv.messages || []);
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view, activeConversationId]);

  const loadConversations = async () => {
    setLoading(true);
    const data = await getConversations();
    setConversations(data);
    setLoading(false);
  };

  const handleOpenConversation = async (conversationId: string) => {
    setLoading(true);
    setError(null);
    setActiveConversationId(conversationId);
    try {
      const conv = await getConversation(conversationId);
      if (conv) {
        setMessages(conv.messages || []);
        setView('conversation');
        // Mark unread messages as read
        const unread = (conv.messages || []).filter((m) => m.is_admin && !m.read_at);
        for (const msg of unread) {
          markMessageRead(conversationId, msg.id).catch(() => {});
        }
      } else {
        setError('Failed to load conversation. Please try again.');
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
      setError('Failed to load conversation. The chat service may be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const conv = await createConversation();
      setActiveConversationId(conv.id);
      setMessages([]);
      setView('conversation');
      await loadConversations();
    } catch (err: any) {
      console.error('Failed to create conversation:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to start a new conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversationId) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(activeConversationId, messageText);
      setMessages((prev) => [...prev, msg]);
      setMessageText('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;
    setSending(true);
    setError(null);
    try {
      const msg = await uploadFile(activeConversationId, file);
      setMessages((prev) => [...prev, msg]);
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to upload file. Please try again.');
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasEngagementService()) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-[#6B7C7C] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1F2121] mb-2">Chat Not Available</h2>
            <p className="text-[#6B7C7C] mb-4">Chat service is not configured. Please contact your administrator.</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#6B7C7C]/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => view === 'list' ? navigate('/dashboard') : (setView('list'), setActiveConversationId(null))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2121]" />
          </button>
          <img src={remsanaIcon} alt="Remsana" className="h-8 w-8" />
          <h1 className="text-lg font-semibold text-[#1F2121]">
            {view === 'conversation' ? 'Chat' : 'Messages'}
          </h1>
          {view === 'list' && (
            <Button size="sm" className="ml-auto" onClick={handleNewConversation}>
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="max-w-4xl mx-auto w-full p-4 space-y-3 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-3">
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
            </div>
          )}
          {loading ? (
            <div className="text-center py-12 text-[#6B7C7C]">Loading conversations…</div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#6B7C7C] mx-auto mb-4" />
                <p className="text-[#6B7C7C] mb-4">No conversations yet</p>
                <Button onClick={handleNewConversation}>Start a Conversation</Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenConversation(conv.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1F2121]">
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-[#6B7C7C] mt-1">
                        {new Date(conv.updated_at).toLocaleString()}
                      </p>
                    </div>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="bg-[#1C1C8B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* CONVERSATION VIEW */}
      {view === 'conversation' && (
        <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
              </div>
            )}
            {loading ? (
              <div className="text-center py-12 text-[#6B7C7C]">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-[#6B7C7C]">
                <p>Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2 ${
                      msg.is_admin
                        ? 'bg-white border border-[#6B7C7C]/20 text-[#1F2121]'
                        : 'bg-[#1C1C8B] text-white'
                    }`}
                  >
                    {msg.type === 'text' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div>
                        {msg.file_url && (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            {msg.content || 'Attached file'}
                          </a>
                        )}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${msg.is_admin ? 'text-[#6B7C7C]' : 'text-white/70'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-[#6B7C7C]/20 p-3">
            <div className="max-w-4xl mx-auto flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg text-[#6B7C7C]"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 border border-[#6B7C7C]/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C8B]/50 resize-none"
              />
              <Button onClick={handleSend} disabled={sending || !messageText.trim()} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

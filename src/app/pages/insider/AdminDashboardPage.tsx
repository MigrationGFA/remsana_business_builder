import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileCheck,
  Video,
  Activity,
  ClipboardList,
  LogOut,
  User,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Headphones,
  Send,
  Paperclip,
  Eye,
  Edit,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Modal, ModalFooter } from '../../components/remsana';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import remsanaIcon from '../../../assets/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
import { getInsiderUser, insiderLogout } from '../../api/insider/auth';
import type { AlertItem } from '../../api/insider/types';
import {
  MOCK_QUICK_STATS,
  MOCK_PLATFORM_HEALTH,
  MOCK_USERS,
  MOCK_AUDIT_LOGS,
} from '../../api/insider/mockData';
import {
  getAdminQuickStats,
  getAdminPlatformHealth,
  getAdminUsers,
  getAdminAuditLogs,
  getAdminAlerts,
  getAdminFinancesSummary,
  getAdminTransactions,
  refundTransaction,
  overrideTransaction,
  getAdminCacRegistrations,
  getAdminCacRegistration,
  approveCacRegistration,
  rejectCacRegistration,
  submitCacToCac,
  getAdminVideos,
  publishVideo,
  unpublishVideo,
  updateVideo,
  getAdminDashboardSummary,
  updateAdminUser,
  resetUserMfa,
  suspendUser,
  banUser,
} from '../../api/insiderApi';
import {
  getAdminTickets,
  getAdminTicket,
  updateAdminTicket,
  addAdminTicketReply,
} from '../../api/insiderTicketApi';
import type { Ticket, TicketWithReplies } from '../../api/insiderTicketApi';
import {
  getAdminConversations,
  getAdminConversation,
  sendAdminMessage,
  uploadAdminFile,
  markAdminMessageRead,
} from '../../api/insiderChatApi';
import type { ChatConversation, ConversationWithMessages } from '../../api/insiderChatApi';

type AdminTab = 'dashboard' | 'users' | 'financials' | 'cac' | 'content' | 'tickets' | 'chat' | 'system' | 'audit';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getInsiderUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState(MOCK_QUICK_STATS);
  const [health, setHealth] = useState(MOCK_PLATFORM_HEALTH);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [users, setUsers] = useState(MOCK_USERS);
  const [_auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [_loading, setLoading] = useState(false);
  const [finances, setFinances] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cacRegistrations, setCacRegistrations] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithReplies | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Chat state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');

  // Modals
  const [cacDetailModal, setCacDetailModal] = useState<any>(null);
  const [editVideoModal, setEditVideoModal] = useState<any>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDescription, setEditVideoDescription] = useState('');
  const [editUserModal, setEditUserModal] = useState<any>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserReason, setEditUserReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/insider', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadDashboardData();
    const t = setInterval(() => {
      loadDashboardData();
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, healthData, usersData, logsData, alertsData, financesData, txnData, cacData, videosData] = await Promise.all([
        getAdminQuickStats(),
        getAdminPlatformHealth(),
        getAdminUsers(1, 50),
        getAdminAuditLogs(100),
        getAdminAlerts(),
        getAdminFinancesSummary(),
        getAdminTransactions(),
        getAdminCacRegistrations(),
        getAdminVideos(),
      ]);

      if (statsData) setStats(statsData);
      if (healthData) setHealth(healthData);
      if (alertsData) setAlerts(alertsData);
      if (usersData) setUsers(usersData.data);
      if (logsData) setAuditLogs(logsData);
      if (financesData) setFinances(financesData);
      if (txnData) setTransactions(txnData.data);
      if (cacData) setCacRegistrations(cacData.data);
      if (videosData) setVideos(videosData.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await insiderLogout();
    navigate('/insider', { replace: true });
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'reset-mfa') => {
    setActionLoading(`${action}-${userId}`);
    try {
      const reason = `Admin action: ${action}`;
      if (action === 'suspend') await suspendUser(userId, reason);
      else if (action === 'ban') await banUser(userId, reason);
      else if (action === 'reset-mfa') await resetUserMfa(userId, reason);
      await loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundTransaction = async (txnId: string) => {
    setActionLoading(`refund-${txnId}`);
    try {
      await refundTransaction(txnId, 'Admin initiated refund');
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to refund:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCacAction = async (regId: string, action: 'approve' | 'reject' | 'submit') => {
    setActionLoading(`${action}-${regId}`);
    try {
      const reason = `Admin ${action}`;
      if (action === 'approve') await approveCacRegistration(regId, reason);
      else if (action === 'reject') await rejectCacRegistration(regId, reason);
      else if (action === 'submit') await submitCacToCac(regId, reason);
      await loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} CAC registration:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVideoAction = async (videoId: string, action: 'publish' | 'unpublish') => {
    setActionLoading(`${action}-${videoId}`);
    try {
      if (action === 'publish') await publishVideo(videoId, 'Admin published');
      else await unpublishVideo(videoId, 'Admin unpublished');
      await loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} video:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOverrideTransaction = async (txnId: string) => {
    setActionLoading(`override-${txnId}`);
    try {
      await overrideTransaction(txnId, 'Admin initiated override');
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to override transaction:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewCacDetail = async (regId: string) => {
    setActionLoading(`view-${regId}`);
    try {
      const detail = await getAdminCacRegistration(regId);
      setCacDetailModal(detail);
    } catch (error) {
      console.error('Failed to load CAC detail:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditVideo = (video: any) => {
    setEditVideoModal(video);
    setEditVideoTitle(video.title || '');
    setEditVideoDescription(video.description || '');
  };

  const handleSaveVideo = async () => {
    if (!editVideoModal) return;
    setActionLoading(`edit-video-${editVideoModal.id}`);
    try {
      await updateVideo(editVideoModal.id, {
        title: editVideoTitle,
        description: editVideoDescription,
        reason: 'Admin update',
      });
      setEditVideoModal(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update video:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (u: any) => {
    setEditUserModal(u);
    setEditUserName(u.email || '');
    setEditUserReason('');
  };

  const handleSaveUser = async () => {
    if (!editUserModal) return;
    setActionLoading(`edit-user-${editUserModal.id}`);
    try {
      await updateAdminUser(editUserModal.id, {
        full_name: editUserName,
        reason: editUserReason || 'Admin update',
      });
      setEditUserModal(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshDashboardSummary = async () => {
    const data = await getAdminDashboardSummary();
    if (data) {
      setStats({
        activeUsers: data.activeUsers ?? stats.activeUsers,
        mrr: data.mrr ?? stats.mrr,
        registrations: data.registrations ?? stats.registrations,
        avgNps: data.avgNps ?? stats.avgNps,
      });
    }
  };

  // Ticket handlers
  const loadTickets = async () => {
    const result = await getAdminTickets();
    setTickets(result.data);
  };

  const handleViewTicket = async (ticketId: string) => {
    const detail = await getAdminTicket(ticketId);
    setSelectedTicket(detail);
    setTicketReplyText('');
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    setActionLoading(`ticket-status-${ticketId}`);
    try {
      await updateAdminTicket(ticketId, { status });
      await handleViewTicket(ticketId);
      await loadTickets();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTicketReply = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    setActionLoading(`ticket-reply-${ticketId}`);
    try {
      await addAdminTicketReply(ticketId, { message: ticketReplyText.trim() });
      setTicketReplyText('');
      await handleViewTicket(ticketId);
    } catch (error) {
      console.error('Failed to add ticket reply:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Chat handlers
  const loadConversations = async () => {
    const convos = await getAdminConversations();
    setConversations(convos);
  };

  const handleViewConversation = async (convoId: string) => {
    const detail = await getAdminConversation(convoId);
    setSelectedConversation(detail);
    setChatMessageText('');
    // Mark all unread messages as read
    if (detail?.messages) {
      for (const msg of detail.messages) {
        if (!msg.is_admin && !msg.read_at) {
          try { await markAdminMessageRead(convoId, msg.id); } catch (_) {}
        }
      }
    }
  };

  const handleSendAdminMessage = async (convoId: string) => {
    if (!chatMessageText.trim()) return;
    setActionLoading(`chat-send-${convoId}`);
    try {
      await sendAdminMessage(convoId, chatMessageText.trim());
      setChatMessageText('');
      await handleViewConversation(convoId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadAdminFile = async (convoId: string, file: File) => {
    setActionLoading(`chat-upload-${convoId}`);
    try {
      await uploadAdminFile(convoId, file);
      await handleViewConversation(convoId);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Load tickets and chats when those tabs are activated
  useEffect(() => {
    if (activeTab === 'tickets') loadTickets();
    if (activeTab === 'chat') loadConversations();
  }, [activeTab]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f3f0fa]">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={remsanaIcon} alt="REMSANA" className="w-9 h-9 object-contain" />
            <span className="font-semibold text-[#1F2121]">REMSANA ADMIN CONSOLE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#6B7C7C] hidden sm:inline">{user.email}</span>
            <Button variant="tertiary" size="sm" onClick={() => {}}>
              <User className="w-4 h-4" /> Profile
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="border-t">
          <TabsList className="w-full max-w-[1200px] mx-auto h-auto flex flex-wrap justify-start gap-0 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1C1C8B] data-[state=active]:bg-transparent">
              <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="financials"><Wallet className="w-4 h-4 mr-1" /> Financials</TabsTrigger>
            <TabsTrigger value="cac"><FileCheck className="w-4 h-4 mr-1" /> CAC/Registrations</TabsTrigger>
            <TabsTrigger value="content"><Video className="w-4 h-4 mr-1" /> Content</TabsTrigger>
            <TabsTrigger value="tickets"><Headphones className="w-4 h-4 mr-1" /> Tickets</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-1" /> Chat</TabsTrigger>
            <TabsTrigger value="system"><Activity className="w-4 h-4 mr-1" /> System Health</TabsTrigger>
            <TabsTrigger value="audit"><ClipboardList className="w-4 h-4 mr-1" /> Audit Logs</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
          <TabsContent value="dashboard" className="mt-0 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-semibold text-[#1F2121]">Quick Stats</h3>
              <Button size="sm" variant="secondary" onClick={handleRefreshDashboardSummary}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh Stats
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><div className="text-[12px] text-[#6B7C7C]">Active Users</div><div className="text-[24px] font-semibold">{stats.activeUsers.toLocaleString()}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-[12px] text-[#6B7C7C]">MRR (This Month)</div><div className="text-[24px] font-semibold">₦{stats.mrr}M</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-[12px] text-[#6B7C7C]">Registrations</div><div className="text-[24px] font-semibold">{stats.registrations}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-[12px] text-[#6B7C7C]">Avg NPS</div><div className="text-[24px] font-semibold">{stats.avgNps}</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-[16px]">Platform Health</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-[14px]">
                <p>Payment System: <Badge>{health.payment.status}</Badge> ({health.payment.errors} errors, {health.payment.successRate}%)</p>
                <p>CAC API: <Badge>{health.cac.status}</Badge> (last check: {health.cac.lastCheck})</p>
                <p>Database: <Badge>{health.database.status}</Badge> (CPU {health.database.cpu}%, Mem {health.database.memory}%, Latency: {health.database.latencyMs}ms)</p>
                <p>API Response Time (avg): {health.apiResponseTimeMs}ms (target: &lt;{health.apiTargetMs}ms)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-[16px] flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Alerts &amp; Actions (Priority Inbox)</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {alerts.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium">{a.priority}) {a.title}</span>
                      {a.detail && <span className="text-[#6B7C7C]">{a.detail}</span>}
                      <span className="flex gap-2">
                        {a.actions.map((act) => (
                          <Button key={act} size="sm" variant="secondary">{act.replace(/_/g, ' ')}</Button>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-2">
                  <input type="search" placeholder="Search email or phone" className="h-9 px-3 rounded-lg border text-[14px] w-48" />
                  <Button size="sm">Filter</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.tier}</TableCell>
                        <TableCell><Badge>{u.status}</Badge></TableCell>
                        <TableCell>{u.joined}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="tertiary" size="sm" onClick={() => handleEditUser(u)}>Edit</Button>
                            <Button variant="tertiary" size="sm" onClick={() => handleUserAction(u.id, 'suspend')} disabled={actionLoading === `suspend-${u.id}`}>Suspend</Button>
                            <Button variant="tertiary" size="sm" onClick={() => handleUserAction(u.id, 'reset-mfa')} disabled={actionLoading === `reset-mfa-${u.id}`}>Reset MFA</Button>
                            <Button variant="danger" size="sm" onClick={() => handleUserAction(u.id, 'ban')} disabled={actionLoading === `ban-${u.id}`}>Ban</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
              <CardContent>
                {finances ? (
                  <>
                    <p className="text-[14px]">Total Revenue: ₦{(finances.totalRevenue ?? 0).toLocaleString()}</p>
                    <p className="text-[14px]">Subscriptions: ₦{(finances.subscriptions ?? 0).toLocaleString()}</p>
                    <p className="text-[14px]">Registration Fees: ₦{(finances.registrationFees ?? 0).toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[14px]">Subscriptions (80%): ₦0.776M</p>
                    <p className="text-[14px]">Registration Fees (20%): ₦0.194M</p>
                    <p className="font-semibold mt-2">TOTAL MRR (This Month): ₦0.97M (up vs Jan 1)</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? transactions.map((txn: any) => (
                      <TableRow key={txn.id}>
                        <TableCell>{txn.email || txn.user_email || '—'}</TableCell>
                        <TableCell>₦{(txn.amount ?? 0).toLocaleString()}</TableCell>
                        <TableCell><Badge>{txn.status || 'unknown'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                          {txn.status === 'failed' && (
                            <Button size="sm" onClick={() => handleRefundTransaction(txn.id)} disabled={actionLoading === `refund-${txn.id}`}>Refund</Button>
                          )}
                          {(txn.status === 'failed' || txn.status === 'pending') && (
                            <Button size="sm" variant="secondary" onClick={() => handleOverrideTransaction(txn.id)} disabled={actionLoading === `override-${txn.id}`}>Override</Button>
                          )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <>
                        <TableRow>
                          <TableCell>chioma@salon.com</TableCell>
                          <TableCell>₦4,999</TableCell>
                          <TableCell>Insufficient Balance</TableCell>
                          <TableCell><Button size="sm">Review</Button></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>amara@agritech.com</TableCell>
                          <TableCell>₦1,250</TableCell>
                          <TableCell>Card Declined (Issuer)</TableCell>
                          <TableCell><Button size="sm">Review</Button></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cac" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>CAC Registrations</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cacRegistrations.length > 0 ? cacRegistrations.map((reg: any) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.user_email || reg.business_name || '—'}</TableCell>
                        <TableCell>{reg.registration_type || 'Business Name'}</TableCell>
                        <TableCell><Badge>{reg.status}</Badge></TableCell>
                        <TableCell>{reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="tertiary" onClick={() => handleViewCacDetail(reg.id)} disabled={actionLoading === `view-${reg.id}`}>
                              <Eye className="w-3 h-3 mr-1" />View
                            </Button>
                            {reg.status === 'submitted' && (
                              <>
                                <Button size="sm" onClick={() => handleCacAction(reg.id, 'submit')} disabled={actionLoading === `submit-${reg.id}`}>Submit to CAC</Button>
                                <Button size="sm" variant="danger" onClick={() => handleCacAction(reg.id, 'reject')} disabled={actionLoading === `reject-${reg.id}`}>Reject</Button>
                              </>
                            )}
                            {reg.status === 'submitted_to_cac' && (
                              <Button size="sm" onClick={() => handleCacAction(reg.id, 'approve')} disabled={actionLoading === `approve-${reg.id}`}>Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <>
                        <TableRow>
                          <TableCell>jude@clothing.ng</TableCell>
                          <TableCell>Business Name</TableCell>
                          <TableCell>Jan 2</TableCell>
                          <TableCell><Button size="sm">Review</Button></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>fola@shipping.com</TableCell>
                          <TableCell>Business Name</TableCell>
                          <TableCell>Jan 5</TableCell>
                          <TableCell><Button size="sm">Review</Button></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Video Library</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.length > 0 ? videos.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.title}</TableCell>
                        <TableCell><Badge>{v.status}</Badge></TableCell>
                        <TableCell>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="tertiary" onClick={() => handleEditVideo(v)}>
                              <Edit className="w-3 h-3 mr-1" />Edit
                            </Button>
                            {v.status !== 'published' && (
                              <Button size="sm" onClick={() => handleVideoAction(v.id, 'publish')} disabled={actionLoading === `publish-${v.id}`}>Publish</Button>
                            )}
                            {v.status === 'published' && (
                              <Button size="sm" variant="danger" onClick={() => handleVideoAction(v.id, 'unpublish')} disabled={actionLoading === `unpublish-${v.id}`}>Unpublish</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <>
                        <TableRow>
                          <TableCell>Financial Management</TableCell>
                          <TableCell><Badge>Published</Badge></TableCell>
                          <TableCell>Jan 1</TableCell>
                          <TableCell><Button size="sm" variant="tertiary">Edit</Button> <Button size="sm" variant="danger">Delete</Button></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tax Compliance 101</TableCell>
                          <TableCell><Badge>Pending</Badge></TableCell>
                          <TableCell>Jan 5</TableCell>
                          <TableCell><Button size="sm" variant="tertiary">Edit</Button> <Button size="sm">Publish</Button></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Marketing Basics</TableCell>
                          <TableCell><Badge>Draft</Badge></TableCell>
                          <TableCell>Jan 12</TableCell>
                          <TableCell><Button size="sm" variant="tertiary">Edit</Button> <Button size="sm">Publish</Button></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Status (Real-time)</CardTitle>
                <Button size="sm" variant="secondary"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
              </CardHeader>
              <CardContent className="space-y-4 text-[14px]">
                <div>
                  <p className="font-medium">DATABASE</p>
                  <p>Status: {health.database.status} | CPU: {health.database.cpu}% | Memory: {health.database.memory}% | Connections: 34/100 | Latency (p95): 23ms | Last Backup: {health.database.lastBackup}</p>
                </div>
                <div>
                  <p className="font-medium">API SERVERS (3 instances)</p>
                  <p>Instance 1: UP (uptime 15d 4h) CPU 38% | Instance 2: UP (8d 2h) CPU 45% | Instance 3: UP (3d 6h) CPU 32%</p>
                  <p>Avg Response Time: {health.apiResponseTimeMs}ms (target &lt;{health.apiTargetMs}ms) | Error Rate: 0.02%</p>
                </div>
                <div>
                  <p className="font-medium">EXTERNAL SERVICES</p>
                  <p>CAC API: CONNECTED | Paystack: OPERATIONAL | SendGrid: OPERATIONAL | S3: OPERATIONAL</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Audit Log (All Admin Actions)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp (UTC)</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_AUDIT_LOGS.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.timestamp}</TableCell>
                        <TableCell>{r.adminEmail}</TableCell>
                        <TableCell>{r.action}</TableCell>
                        <TableCell>{r.reason ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-0 space-y-6">
            {selectedTicket ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-[12px] text-[#6B7C7C] mt-1">
                      Status: <Badge>{selectedTicket.status}</Badge> | Priority: <Badge>{selectedTicket.priority}</Badge> | {selectedTicket.user_name || 'Unknown user'}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setSelectedTicket(null)}>
                    <X className="w-4 h-4 mr-1" /> Back to list
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-[#f3f0fa] rounded-lg">
                    <p className="text-[14px]">{selectedTicket.message}</p>
                    <p className="text-[11px] text-[#6B7C7C] mt-1">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies?.map((reply) => (
                    <div key={reply.id} className={`p-3 rounded-lg ${reply.is_admin ? 'bg-[#1C1C8B]/5 border-l-4 border-[#1C1C8B]' : 'bg-gray-50'}`}>
                      <p className="text-[12px] font-medium text-[#1F2121] mb-1">{reply.is_admin ? 'Admin Reply' : reply.user_name || 'User'}</p>
                      <p className="text-[14px]">{reply.message}</p>
                      <p className="text-[11px] text-[#6B7C7C] mt-1">{new Date(reply.created_at).toLocaleString()}</p>
                    </div>
                  ))}

                  {/* Status update */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button size="sm" variant="secondary" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')} disabled={actionLoading?.startsWith('ticket-status')}>In Progress</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')} disabled={actionLoading?.startsWith('ticket-status')}>Resolve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')} disabled={actionLoading?.startsWith('ticket-status')}>Close</Button>
                  </div>

                  {/* Reply form */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type admin reply..."
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleTicketReply(selectedTicket.id); }}
                    />
                    <Button size="sm" onClick={() => handleTicketReply(selectedTicket.id)} disabled={!ticketReplyText.trim() || actionLoading?.startsWith('ticket-reply')}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Support Tickets</CardTitle>
                  <Button size="sm" variant="secondary" onClick={loadTickets}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                </CardHeader>
                <CardContent>
                  {tickets.length === 0 ? (
                    <p className="text-[14px] text-[#6B7C7C] text-center py-8">No tickets found. Tickets from SME users will appear here.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.subject}</TableCell>
                            <TableCell>{t.user_name || '—'}</TableCell>
                            <TableCell><Badge>{t.priority}</Badge></TableCell>
                            <TableCell><Badge>{t.status}</Badge></TableCell>
                            <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="tertiary" onClick={() => handleViewTicket(t.id)}>
                                <Eye className="w-3 h-3 mr-1" />View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 400 }}>
              {/* Conversation list */}
              <Card className="md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-[14px]">Conversations</CardTitle>
                  <Button size="sm" variant="tertiary" onClick={loadConversations}><RefreshCw className="w-3 h-3" /></Button>
                </CardHeader>
                <CardContent className="p-0">
                  {conversations.length === 0 ? (
                    <p className="text-[13px] text-[#6B7C7C] text-center py-8 px-4">No conversations yet.</p>
                  ) : (
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                      {conversations.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleViewConversation(c.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#f3f0fa] transition-colors ${
                            selectedConversation?.id === c.id ? 'bg-[#1C1C8B]/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-[#1F2121] truncate">
                              {c.last_message?.content?.slice(0, 40) || 'Conversation'}
                            </span>
                            {(c.unread_count ?? 0) > 0 && (
                              <span className="ml-2 w-5 h-5 bg-[#C01F2F] text-white text-[10px] rounded-full flex items-center justify-center">{c.unread_count}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B7C7C]">{new Date(c.updated_at).toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message area */}
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  {selectedConversation ? (
                    <div className="flex flex-col" style={{ minHeight: 350 }}>
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[300px]">
                        {selectedConversation.messages?.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              msg.is_admin ? 'bg-[#1C1C8B] text-white' : 'bg-gray-100'
                            }`}>
                              {msg.type === 'file' && msg.file_url ? (
                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-[13px]">{msg.content || 'File'}</a>
                              ) : (
                                <p className="text-[13px]">{msg.content}</p>
                              )}
                              <p className={`text-[10px] mt-1 ${msg.is_admin ? 'text-white/70' : 'text-[#6B7C7C]'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 border-t pt-3">
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadAdminFile(selectedConversation.id, file);
                          }} />
                          <div className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-gray-50">
                            <Paperclip className="w-4 h-4 text-[#6B7C7C]" />
                          </div>
                        </label>
                        <Input
                          type="text"
                          placeholder="Type message..."
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendAdminMessage(selectedConversation.id); }}
                        />
                        <Button size="sm" onClick={() => handleSendAdminMessage(selectedConversation.id)} disabled={!chatMessageText.trim() || actionLoading?.startsWith('chat-send')}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-[#6B7C7C] text-[14px]" style={{ minHeight: 350 }}>
                      Select a conversation to view messages
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* CAC Detail Modal */}
      <Modal isOpen={!!cacDetailModal} onClose={() => setCacDetailModal(null)} title="CAC Registration Detail" size="md">
        {cacDetailModal && (
          <div className="py-4 space-y-3 text-[14px]">
            <div><span className="text-[#6B7C7C]">ID:</span> <span className="font-medium">{cacDetailModal.id}</span></div>
            <div><span className="text-[#6B7C7C]">Type:</span> <span className="font-medium">{cacDetailModal.registration_type || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Business Name:</span> <span className="font-medium">{cacDetailModal.business_name || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Alt Name:</span> <span className="font-medium">{cacDetailModal.business_name_alt || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Status:</span> <Badge>{cacDetailModal.status}</Badge></div>
            <div><span className="text-[#6B7C7C]">Current Step:</span> <span className="font-medium">{cacDetailModal.current_step || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Objects:</span> <span className="font-medium">{cacDetailModal.business_objects?.join(', ') || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Address:</span> <span className="font-medium">{cacDetailModal.registered_address || '—'}</span></div>
            <div><span className="text-[#6B7C7C]">Commencement:</span> <span className="font-medium">{cacDetailModal.commencement_date || '—'}</span></div>
            {cacDetailModal.proprietors?.length > 0 && (
              <div>
                <p className="text-[#6B7C7C] mb-1">Proprietors:</p>
                {cacDetailModal.proprietors.map((p: any, i: number) => (
                  <div key={i} className="ml-3 p-2 bg-gray-50 rounded mb-1">
                    <p className="font-medium">{p.fullName} ({p.email})</p>
                    <p className="text-[12px] text-[#6B7C7C]">{p.phone} | {p.occupation} | {p.address}</p>
                  </div>
                ))}
              </div>
            )}
            <div><span className="text-[#6B7C7C]">Created:</span> <span className="font-medium">{cacDetailModal.created_at ? new Date(cacDetailModal.created_at).toLocaleString() : '—'}</span></div>
            <ModalFooter>
              <Button variant="secondary" size="md" onClick={() => setCacDetailModal(null)}>Close</Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Edit Video Modal */}
      <Modal isOpen={!!editVideoModal} onClose={() => setEditVideoModal(null)} title="Edit Video" size="md">
        {editVideoModal && (
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Title</label>
              <Input type="text" value={editVideoTitle} onChange={(e) => setEditVideoTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Description</label>
              <textarea
                value={editVideoDescription}
                onChange={(e) => setEditVideoDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-[4px] border border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20 outline-none text-[14px] resize-none"
              />
            </div>
            <ModalFooter>
              <Button variant="secondary" size="md" onClick={() => setEditVideoModal(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleSaveVideo} disabled={actionLoading?.startsWith('edit-video')}>Save Changes</Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUserModal} onClose={() => setEditUserModal(null)} title="Edit User" size="sm">
        {editUserModal && (
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Full Name</label>
              <Input type="text" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1F2121] mb-2">Reason for update</label>
              <Input type="text" value={editUserReason} onChange={(e) => setEditUserReason(e.target.value)} placeholder="e.g. Name correction" />
            </div>
            <ModalFooter>
              <Button variant="secondary" size="md" onClick={() => setEditUserModal(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleSaveUser} disabled={actionLoading?.startsWith('edit-user')}>Save</Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../components/remsana';
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
import {
  MOCK_QUICK_STATS,
  MOCK_PLATFORM_HEALTH,
  MOCK_ALERTS,
  MOCK_USERS,
  MOCK_AUDIT_LOGS,
} from '../../api/insider/mockData';
import {
  getAdminQuickStats,
  getAdminPlatformHealth,
  getAdminUsers,
  getAdminAuditLogs,
} from '../../api/insiderApi';

type AdminTab = 'dashboard' | 'users' | 'financials' | 'cac' | 'content' | 'system' | 'audit';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getInsiderUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState(MOCK_QUICK_STATS);
  const [health, setHealth] = useState(MOCK_PLATFORM_HEALTH);
  const [users, setUsers] = useState(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

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
      const [statsData, healthData, usersData, logsData] = await Promise.all([
        getAdminQuickStats(),
        getAdminPlatformHealth(),
        getAdminUsers(1, 50),
        getAdminAuditLogs(100),
      ]);

      if (statsData) setStats(statsData);
      if (healthData) setHealth(healthData);
      if (usersData) setUsers(usersData.data);
      if (logsData) setAuditLogs(logsData);
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
            <TabsTrigger value="system"><Activity className="w-4 h-4 mr-1" /> System Health</TabsTrigger>
            <TabsTrigger value="audit"><ClipboardList className="w-4 h-4 mr-1" /> Audit Logs</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
          <TabsContent value="dashboard" className="mt-0 space-y-6">
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
                  {MOCK_ALERTS.map((a) => (
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
                    {MOCK_USERS.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.tier}</TableCell>
                        <TableCell><Badge>{u.status}</Badge></TableCell>
                        <TableCell>{u.joined}</TableCell>
                        <TableCell><Button variant="tertiary" size="sm"><ChevronDown className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>Revenue Overview — January 2026</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">Subscriptions (80%): ₦0.776M</p>
                <p className="text-[14px]">Registration Fees (20%): ₦0.194M</p>
                <p className="font-semibold mt-2">TOTAL MRR (This Month): ₦0.97M (up vs Jan 1)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Failed Transactions (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cac" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle>CAC Workflow Status (Manual Processing)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[14px]">Submitted: 8 (Avg 2.3 days) | Approved: 3 (Avg 1.8 days) | Rejected: 1 | Pending: 4</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pending Approvals Queue</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
        </Tabs>
      </main>
    </div>
  );
}

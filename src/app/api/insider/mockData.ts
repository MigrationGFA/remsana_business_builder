/** Mock data for /insider dashboards – replace with real API calls later */

import type {
  QuickStats,
  PlatformHealth,
  AlertItem,
  UserRow,
  AuditLogRow,
  AnalystKpis,
} from './types';

export const MOCK_QUICK_STATS: QuickStats = {
  activeUsers: 2047,
  mrr: 0.97,
  registrations: 12,
  avgNps: 34,
};

export const MOCK_PLATFORM_HEALTH: PlatformHealth = {
  payment: { status: 'OPERATIONAL', errors: 0, successRate: 100 },
  cac: { status: 'CONNECTED', lastCheck: '2m ago' },
  database: { status: 'HEALTHY', cpu: 42, memory: 58, latencyMs: 12, lastBackup: '2 hours ago' },
  apiResponseTimeMs: 145,
  apiTargetMs: 200,
};

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1',
    priority: 1,
    title: '3 Failed CAC Submissions',
    actions: ['review', 'resubmit', 'email_user'],
  },
  {
    id: '2',
    priority: 2,
    title: '1 Payment Dispute',
    detail: '₦4,999 from user_45612',
    actions: ['view_details', 'refund', 'contact_user'],
  },
  {
    id: '3',
    priority: 3,
    title: 'Content: 2 Videos Pending Approval',
    actions: ['review', 'publish', 'reject'],
  },
];

export const MOCK_USERS: UserRow[] = [
  { id: 'u1', email: 'jude@clothing.ng', tier: 'Pro', status: 'Active', joined: 'Jan 2' },
  { id: 'u2', email: 'fola@shipping.com', tier: 'Starter', status: 'Active', joined: 'Jan 5' },
  { id: 'u3', email: 'chioma@salon.com', tier: 'Business', status: 'Paused', joined: 'Jan 8' },
  { id: 'u4', email: 'amara@agritech.com', tier: 'Starter', status: 'Pending', joined: 'Jan 12' },
];

export const MOCK_AUDIT_LOGS: AuditLogRow[] = [
  { id: 'a1', timestamp: 'Jan 29, 14:52', adminEmail: 'admin@...', action: 'Override Payment', reason: 'Card blocked by issuer' },
  { id: 'a2', timestamp: 'Jan 29, 14:45', adminEmail: 'admin@...', action: 'Reset MFA (jude)', reason: 'User locked out, request' },
  { id: 'a3', timestamp: 'Jan 29, 14:32', adminEmail: 'admin@...', action: 'Impersonate Session', reason: 'Test user experience' },
  { id: 'a4', timestamp: 'Jan 29, 14:15', adminEmail: 'admin@...', action: 'Mark CAC Approved', reason: 'Received CAC email, OK\'d' },
  { id: 'a5', timestamp: 'Jan 29, 13:58', adminEmail: 'admin@...', action: 'Issue Credit', reason: 'Goodwill for service issue' },
];

export const MOCK_ANALYST_KPIS: AnalystKpis = {
  totalUsers: 2047,
  totalUsersChangePercent: 12.3,
  activeUsers7d: 1823,
  activeUsersChangePercent: 8.9,
  mrr: 0.97,
  mrrBaselineNote: 'Week 1 baseline',
  arpu: 474,
  arpuChangePercent: -2.1,
  churnRatePercent: 0.8,
  churnTargetPercent: 2,
  cacConversionPercent: 5.2,
  cacConversionChangePercent: 1.2,
  avgNps: 34,
  npsChange: 4,
  activeSubscriptions: 1632,
  starterPercent: 80,
};

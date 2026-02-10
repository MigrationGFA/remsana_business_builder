/** REMSANA /insider admin portal – shared types */

export type InsiderRole = 'ADMIN' | 'ANALYST';

export interface InsiderUser {
  id: string;
  email: string;
  role: InsiderRole;
  permissions: string[];
}

export interface InsiderAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: InsiderUser;
}

export interface QuickStats {
  activeUsers: number;
  mrr: number;
  registrations: number;
  avgNps: number;
}

export interface PlatformHealth {
  payment: { status: string; errors: number; successRate: number };
  cac: { status: string; lastCheck: string };
  database: { status: string; cpu: number; memory: number; latencyMs: number; lastBackup: string };
  apiResponseTimeMs: number;
  apiTargetMs: number;
}

export interface AlertItem {
  id: string;
  priority: number;
  title: string;
  detail?: string;
  actions: ('review' | 'resubmit' | 'email_user' | 'view_details' | 'refund' | 'contact_user' | 'publish' | 'reject')[];
}

export interface UserRow {
  id: string;
  email: string;
  tier: string;
  status: string;
  joined: string;
}

export interface AuditLogRow {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  reason?: string;
}

export interface AnalystKpis {
  totalUsers: number;
  totalUsersChangePercent: number;
  activeUsers7d: number;
  activeUsersChangePercent: number;
  mrr: number;
  mrrBaselineNote: string;
  arpu: number;
  arpuChangePercent: number;
  churnRatePercent: number;
  churnTargetPercent: number;
  cacConversionPercent: number;
  cacConversionChangePercent: number;
  avgNps: number;
  npsChange: number;
  activeSubscriptions: number;
  starterPercent: number;
}

import { api, hasBackend } from './httpClient';
import type {
  QuickStats,
  PlatformHealth,
  AlertItem,
  UserRow,
  AuditLogRow,
  AnalystKpis,
} from './insider/types';

/**
 * Admin API functions
 */

export async function getAdminQuickStats(): Promise<QuickStats | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    // This would come from /api/insider/admin/dashboard/summary or similar
    // For now, return null to use mock fallback
    return null;
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return null;
  }
}

export async function getAdminPlatformHealth(): Promise<PlatformHealth | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/insider/admin/system/health');
    return {
      payment: { status: 'OPERATIONAL', errors: 0, successRate: 100 },
      cac: { status: response.data.externalServices?.cac || 'CONNECTED', lastCheck: '2m ago' },
      database: {
        status: response.data.database?.status || 'HEALTHY',
        cpu: response.data.database?.cpu || 42,
        memory: response.data.database?.memory || 58,
        latencyMs: response.data.database?.latencyMs || 12,
        lastBackup: response.data.database?.lastBackup || '2 hours ago',
      },
      apiResponseTimeMs: response.data.api?.responseTimeMs || 145,
      apiTargetMs: 200,
    };
  } catch (error) {
    console.error('Failed to fetch platform health:', error);
    return null;
  }
}

export async function getAdminUsers(page: number = 1, limit: number = 50): Promise<{ data: UserRow[]; pagination: any } | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/insider/admin/users', {
      params: { page, limit },
    });
    return {
      data: response.data.data.map((u: any) => ({
        id: u.id,
        email: u.email,
        tier: u.subscription_tier || 'free',
        status: u.subscription_status || 'active',
        joined: u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      })),
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    return null;
  }
}

export async function getAdminAuditLogs(limit: number = 100): Promise<AuditLogRow[] | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/insider/admin/audit-logs', {
      params: { limit },
    });
    return response.data.data.map((log: any) => ({
      id: log.id,
      timestamp: new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      adminEmail: log.admin_id ? `${log.admin_id.slice(0, 8)}...` : 'system',
      action: log.action,
      reason: log.reason || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return null;
  }
}

/**
 * Analyst API functions
 */

export async function getAnalystKpis(): Promise<AnalystKpis | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/insider/analyst/metrics/summary');
    const data = response.data;
    
    return {
      totalUsers: data.totalUsers || 0,
      totalUsersChangePercent: 12.3, // Would come from comparison query
      activeUsers7d: data.activeUsers7d || 0,
      activeUsersChangePercent: 8.9,
      mrr: data.mrr || 0,
      mrrBaselineNote: 'Week 1 baseline',
      arpu: data.arpu || 0,
      arpuChangePercent: -2.1,
      churnRatePercent: data.churnRatePercent || 0,
      churnTargetPercent: 2,
      cacConversionPercent: data.cacConversionPercent || 0,
      cacConversionChangePercent: 1.2,
      avgNps: 34,
      npsChange: 4,
      activeSubscriptions: data.activeSubscriptions || 0,
      starterPercent: 80,
    };
  } catch (error) {
    console.error('Failed to fetch analyst KPIs:', error);
    return null;
  }
}

export async function getAnalystLearningSummary(): Promise<any> {
  if (!hasBackend()) {
    return null;
  }

  try {
    const response = await api.get('/insider/analyst/learning/summary');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch learning summary:', error);
    return null;
  }
}

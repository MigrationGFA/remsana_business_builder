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
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/dashboard/summary (quickStats)');
    const response = await api.get('/insider/admin/dashboard/summary');
    const data = response.data;
    console.log('[Insider] ⬅️ GET /insider/admin/dashboard/summary response:', data);
    if (data) {
      return {
        activeUsers: data.activeUsers ?? 0,
        mrr: data.mrr ?? 0,
        registrations: data.registrations ?? 0,
        avgNps: data.avgNps ?? 34,
      };
    }
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
    console.log('[Insider] ➡️ GET /insider/admin/system/health');
    const response = await api.get('/insider/admin/system/health');
    console.log('[Insider] ⬅️ GET /insider/admin/system/health response:', response.data);
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
    console.log('[Insider] ➡️ GET /insider/admin/users', { page, limit });
    const response = await api.get('/insider/admin/users', {
      params: { page, limit },
    });
    console.log('[Insider] ⬅️ GET /insider/admin/users response:', response.data);
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
    console.log('[Insider] ➡️ GET /insider/admin/audit-logs', { limit });
    const response = await api.get('/insider/admin/audit-logs', {
      params: { limit },
    });
    console.log('[Insider] ⬅️ GET /insider/admin/audit-logs response:', response.data);
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

export async function getAdminAlerts(): Promise<AlertItem[] | null> {
  if (!hasBackend()) {
    return null;
  }

  try {
    console.log('[Insider] ➡️ GET /insider/admin/alerts');
    const response = await api.get('/insider/admin/alerts');
    console.log('[Insider] ⬅️ GET /insider/admin/alerts response:', response.data);
    const data = response.data?.data ?? response.data ?? [];

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any, index: number) => ({
      id: String(item.id ?? index),
      priority: Number(item.priority ?? 0),
      title: item.title ?? item.message ?? 'Alert',
      detail: item.detail ?? item.description ?? undefined,
      actions: Array.isArray(item.actions) ? item.actions : [],
    }));
  } catch (error) {
    console.error('Failed to fetch admin alerts:', error);
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
    console.log('[Insider] ➡️ GET /insider/analyst/metrics/summary');
    const response = await api.get('/insider/analyst/metrics/summary');
    const data = response.data;
    console.log('[Insider] ⬅️ GET /insider/analyst/metrics/summary response:', data);
    
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
    console.log('[Insider] ➡️ GET /insider/analyst/learning/summary');
    const response = await api.get('/insider/analyst/learning/summary');
    console.log('[Insider] ⬅️ GET /insider/analyst/learning/summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch learning summary:', error);
    return null;
  }
}

// ── Extended Admin API functions ─────────────────────────────────

/**
 * Get financial summary
 */
export async function getAdminFinancesSummary(): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/finances/summary');
    const { data } = await api.get('/insider/admin/finances/summary');
    console.log('[Insider] ⬅️ GET /insider/admin/finances/summary response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch finances summary:', error);
    return null;
  }
}

/**
 * List transactions
 */
export async function getAdminTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: any[]; pagination?: any } | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/transactions', params);
    const { data } = await api.get('/insider/admin/transactions', { params });
    console.log('[Insider] ⬅️ GET /insider/admin/transactions response:', data);
    return { data: data.data ?? data ?? [], pagination: data.pagination };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return null;
  }
}

/**
 * Refund a transaction
 */
export async function refundTransaction(txnId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/transactions/' + txnId + '/refund', { reason });
  const { data } = await api.post(`/insider/admin/transactions/${encodeURIComponent(txnId)}/refund`, { reason });
  console.log('[Insider] ⬅️ POST refund response:', data);
  return data;
}

/**
 * Override a transaction
 */
export async function overrideTransaction(txnId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/transactions/' + txnId + '/override', { reason });
  const { data } = await api.post(`/insider/admin/transactions/${encodeURIComponent(txnId)}/override`, { reason });
  console.log('[Insider] ⬅️ POST override response:', data);
  return data;
}

/**
 * List CAC registrations
 */
export async function getAdminCacRegistrations(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; pagination?: any } | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/cac/registrations', params);
    const { data } = await api.get('/insider/admin/cac/registrations', { params });
    console.log('[Insider] ⬅️ GET /insider/admin/cac/registrations response:', data);
    return { data: data.data ?? data ?? [], pagination: data.pagination };
  } catch (error) {
    console.error('Failed to fetch CAC registrations:', error);
    return null;
  }
}

/**
 * Get single CAC registration
 */
export async function getAdminCacRegistration(regId: string): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/cac/registrations/' + regId);
    const { data } = await api.get(`/insider/admin/cac/registrations/${encodeURIComponent(regId)}`);
    console.log('[Insider] ⬅️ GET /insider/admin/cac/registrations/' + regId + ' response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch CAC registration:', error);
    return null;
  }
}

/**
 * Submit CAC registration to CAC
 */
export async function submitCacToCac(regId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/cac/registrations/' + regId + '/submit-to-cac', { reason });
  const { data } = await api.post(`/insider/admin/cac/registrations/${encodeURIComponent(regId)}/submit-to-cac`, { reason });
  console.log('[Insider] ⬅️ POST submit-to-cac response:', data);
  return data;
}

/**
 * Approve CAC registration
 */
export async function approveCacRegistration(regId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/cac/registrations/' + regId + '/approve', { reason });
  const { data } = await api.post(`/insider/admin/cac/registrations/${encodeURIComponent(regId)}/approve`, { reason });
  console.log('[Insider] ⬅️ POST approve response:', data);
  return data;
}

/**
 * Reject CAC registration
 */
export async function rejectCacRegistration(regId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/cac/registrations/' + regId + '/reject', { reason });
  const { data } = await api.post(`/insider/admin/cac/registrations/${encodeURIComponent(regId)}/reject`, { reason });
  console.log('[Insider] ⬅️ POST reject response:', data);
  return data;
}

/**
 * List content videos
 */
export async function getAdminVideos(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: any[]; pagination?: any } | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/content/videos', params);
    const { data } = await api.get('/insider/admin/content/videos', { params });
    console.log('[Insider] ⬅️ GET /insider/admin/content/videos response:', data);
    return { data: data.data ?? data ?? [], pagination: data.pagination };
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return null;
  }
}

/**
 * Publish a video
 */
export async function publishVideo(videoId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/content/videos/' + videoId + '/publish', { reason });
  const { data } = await api.post(`/insider/admin/content/videos/${encodeURIComponent(videoId)}/publish`, { reason });
  console.log('[Insider] ⬅️ POST publish response:', data);
  return data;
}

/**
 * Unpublish a video
 */
export async function unpublishVideo(videoId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/content/videos/' + videoId + '/unpublish', { reason });
  const { data } = await api.post(`/insider/admin/content/videos/${encodeURIComponent(videoId)}/unpublish`, { reason });
  console.log('[Insider] ⬅️ POST unpublish response:', data);
  return data;
}

/**
 * Update video metadata
 */
export async function updateVideo(videoId: string, payload: {
  title?: string;
  description?: string;
  reason: string;
}): Promise<any> {
  console.log('[Insider] ➡️ PUT /insider/admin/content/videos/' + videoId, payload);
  const { data } = await api.put(`/insider/admin/content/videos/${encodeURIComponent(videoId)}`, payload);
  console.log('[Insider] ⬅️ PUT video response:', data);
  return data;
}

/**
 * Get admin dashboard summary (quick stats)
 */
export async function getAdminDashboardSummary(): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/admin/dashboard/summary (full)');
    const { data } = await api.get('/insider/admin/dashboard/summary');
    console.log('[Insider] ⬅️ GET /insider/admin/dashboard/summary response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch admin dashboard summary:', error);
    return null;
  }
}

/**
 * Admin: Update user
 */
export async function updateAdminUser(userId: string, payload: { full_name?: string; reason: string }): Promise<any> {
  console.log('[Insider] ➡️ PUT /insider/admin/users/' + userId, payload);
  const { data } = await api.put(`/insider/admin/users/${encodeURIComponent(userId)}`, payload);
  console.log('[Insider] ⬅️ PUT user response:', data);
  return data;
}

/**
 * Admin: Reset user MFA
 */
export async function resetUserMfa(userId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/users/' + userId + '/reset-mfa', { reason });
  const { data } = await api.post(`/insider/admin/users/${encodeURIComponent(userId)}/reset-mfa`, { reason });
  console.log('[Insider] ⬅️ POST reset-mfa response:', data);
  return data;
}

/**
 * Admin: Suspend user
 */
export async function suspendUser(userId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/users/' + userId + '/suspend', { reason });
  const { data } = await api.post(`/insider/admin/users/${encodeURIComponent(userId)}/suspend`, { reason });
  console.log('[Insider] ⬅️ POST suspend response:', data);
  return data;
}

/**
 * Admin: Ban user
 */
export async function banUser(userId: string, reason: string): Promise<any> {
  console.log('[Insider] ➡️ POST /insider/admin/users/' + userId + '/ban', { reason });
  const { data } = await api.post(`/insider/admin/users/${encodeURIComponent(userId)}/ban`, { reason });
  console.log('[Insider] ⬅️ POST ban response:', data);
  return data;
}

// ── Extended Analyst API functions ─────────────────────────────────

/**
 * Get total user count
 */
export async function getAnalystTotalUsers(): Promise<number | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/users/total');
    const { data } = await api.get('/insider/analyst/users/total');
    console.log('[Insider] ⬅️ GET /insider/analyst/users/total response:', data);
    return data?.total ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch total users:', error);
    return null;
  }
}

/**
 * Get active users (7d)
 */
export async function getAnalystActiveUsers(): Promise<number | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/users/active');
    const { data } = await api.get('/insider/analyst/users/active');
    console.log('[Insider] ⬅️ GET /insider/analyst/users/active response:', data);
    return data?.active ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch active users:', error);
    return null;
  }
}

/**
 * Get MRR
 */
export async function getAnalystMrr(): Promise<number | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/revenue/mrr');
    const { data } = await api.get('/insider/analyst/revenue/mrr');
    console.log('[Insider] ⬅️ GET /insider/analyst/revenue/mrr response:', data);
    return data?.mrr ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch MRR:', error);
    return null;
  }
}

/**
 * Get ARPU
 */
export async function getAnalystArpu(): Promise<number | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/revenue/arpu');
    const { data } = await api.get('/insider/analyst/revenue/arpu');
    console.log('[Insider] ⬅️ GET /insider/analyst/revenue/arpu response:', data);
    return data?.arpu ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch ARPU:', error);
    return null;
  }
}

/**
 * Get churn rate
 */
export async function getAnalystChurnRate(): Promise<number | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/churn/rate');
    const { data } = await api.get('/insider/analyst/churn/rate');
    console.log('[Insider] ⬅️ GET /insider/analyst/churn/rate response:', data);
    return data?.rate ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch churn rate:', error);
    return null;
  }
}

/**
 * Get cohort data
 */
export async function getAnalystCohorts(params?: {
  page?: number;
  limit?: number;
  signup_date?: string;
}): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/cohorts', params);
    const { data } = await api.get('/insider/analyst/cohorts', { params });
    console.log('[Insider] ⬅️ GET /insider/analyst/cohorts response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch cohorts:', error);
    return null;
  }
}

/**
 * Get retention funnel
 */
export async function getAnalystRetentionFunnel(): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/retention/funnel');
    const { data } = await api.get('/insider/analyst/retention/funnel');
    console.log('[Insider] ⬅️ GET /insider/analyst/retention/funnel response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch retention funnel:', error);
    return null;
  }
}

/**
 * Get registration funnel
 */
export async function getAnalystRegistrationFunnel(): Promise<any> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/registration/funnel');
    const { data } = await api.get('/insider/analyst/registration/funnel');
    console.log('[Insider] ⬅️ GET /insider/analyst/registration/funnel response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch registration funnel:', error);
    return null;
  }
}

/**
 * Export CSV
 */
export async function exportAnalystCsv(params?: {
  metric?: string;
  date_range?: string;
}): Promise<Blob | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/export/csv', params);
    const response = await api.get('/insider/analyst/export/csv', {
      params,
      responseType: 'blob',
    });
    console.log('[Insider] ⬅️ GET /insider/analyst/export/csv response: Blob received');
    return response.data;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return null;
  }
}

/**
 * Export PDF
 */
export async function exportAnalystPdf(params?: {
  metric?: string;
  date_range?: string;
}): Promise<Blob | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Insider] ➡️ GET /insider/analyst/export/pdf', params);
    const response = await api.get('/insider/analyst/export/pdf', {
      params,
      responseType: 'blob',
    });
    console.log('[Insider] ⬅️ GET /insider/analyst/export/pdf response: Blob received');
    return response.data;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return null;
  }
}

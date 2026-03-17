/**
 * ADDON: Dynamic Data Replacement – Dashboard API client
 * Calls GET /dashboard/me for aggregated SME dashboard data.
 */

import { api } from './httpClient';

export const dashboardApi = {
  getMe: async () => {
    const res = await api.get('/dashboard/me');
    return res.data as {
      registrationStatus: Record<string, unknown>;
      learningProgress: Record<string, unknown>;
      certificates: Array<Record<string, unknown>>;
      recentActivity: Array<Record<string, unknown>>;
      recommendedResources: Array<Record<string, unknown>>;
    };
  },
};

import { apiRequest } from './client';

export interface AnalyticsSummary {
  brands?: { total: number };
  posts?: { total: number; verifiedFactChecked?: number };
  campaigns?: { total: number; active: number };
  contentVelocity?: number;
  creditsBalance?: number;
}

export const analyticsApi = {
  getSummary: (params: {
    workspaceId?: string;
    brandName?: string;
    userEmail?: string;
  } = {}): Promise<{ success: boolean; analytics: AnalyticsSummary }> =>
    apiRequest('/analytics/summary', {
      method: 'GET',
      params,
    }),
};

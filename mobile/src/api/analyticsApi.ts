import { apiRequest } from './client';
import { AnalyticsSummary } from '../types';

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

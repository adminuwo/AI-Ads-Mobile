import { apiRequest } from './client';
import { MarketingStrategy, StrategyCard } from '../types';

export const strategyApi = {
  generateStrategy: (
    workspaceId: string,
    payload: {
      brandName?: string;
      industry?: string;
      goals?: string[];
      targetAudience?: any;
    } = {}
  ): Promise<{ success: boolean; strategy?: MarketingStrategy; currentStrategy?: any; error?: string }> =>
    apiRequest(`/workspace/${workspaceId}/generate-strategy`, {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  regenerateCard: (
    workspaceId: string,
    cardId: string,
    instructions?: string
  ): Promise<{ success: boolean; card?: StrategyCard; error?: string }> =>
    apiRequest(`/workspace/${workspaceId}/regenerate-strategy-card`, {
      method: 'POST',
      body: JSON.stringify({ cardId, instructions }),
      timeoutMs: 30000,
    }),

  saveStrategy: (workspaceId: string, strategy: any): Promise<{ success: boolean }> =>
    apiRequest(`/workspace/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentStrategy: strategy }),
    }),
};

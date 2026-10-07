import { apiRequest } from './client';
import { StrategyData, StrategyCard } from '../types';

export const strategyApi = {
  generateStrategy: (
    workspaceId: string,
    payload: {
      brandName?: string;
      industry?: string;
      goals?: string[];
      targetAudience?: any;
    } = {}
  ): Promise<{ success: boolean; strategy?: any; currentStrategy?: any; error?: string }> =>
    apiRequest(`/workspace/${workspaceId}/generate-strategy`, {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  generateCustomStrategy: (
    workspaceId: string,
    payload: {
      directive?: string;
      referenceImageUrl?: string | null;
      brandName?: string;
      industry?: string;
      tagline?: string;
      companyDescription?: string;
      brandColors?: string[];
    }
  ): Promise<{ success: boolean; customStrategy?: any; engine?: string; error?: string }> =>
    apiRequest(`/workspace/${workspaceId}/generate-custom-strategy`, {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  regenerateCard: (
    workspaceId: string,
    payload: {
      cardId?: string;
      day?: number;
      currentTopic?: string;
      currentActionItem?: string;
      platform?: string;
      pillar?: string;
      userDirective?: string;
    } | string,
    instructions?: string
  ): Promise<{ success: boolean; card?: StrategyCard; updatedCard?: any; error?: string }> => {
    const body = typeof payload === 'string'
      ? { cardId: payload, instructions }
      : payload;

    return apiRequest(`/workspace/${workspaceId}/regenerate-strategy-card`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 30000,
    });
  },

  saveStrategy: (workspaceId: string, strategy: any): Promise<{ success: boolean }> =>
    apiRequest(`/workspace/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentStrategy: strategy }),
    }),
};

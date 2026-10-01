import { apiRequest } from './client';

export const creativeApi = {
  getCredits: (): Promise<{ success: boolean; credits: { tier: string; balance: number } }> =>
    apiRequest('/creative/credits', {
      method: 'GET',
    }),

  generateVisual: (payload: {
    prompt: string;
    style?: string;
    aspectRatio?: string;
    brandName?: string;
    creditCost?: number;
  }): Promise<{ success: boolean; asset: { id: string; imageUrl: string; url?: string }; error?: string }> =>
    apiRequest('/creative/visual/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  craftAndGenerateVisual: (payload: {
    topic: string;
    style: string;
    aspectRatio: string;
    brandContext?: any;
  }): Promise<{ success: boolean; imageUrl: string; asset?: any; promptUsed?: string; error?: string }> =>
    apiRequest('/creative/craft-and-generate-visual', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),
};

import { apiRequest } from './client';

export const campaignApi = {
  list: (params: { workspaceId?: string } = {}): Promise<{ success: boolean; campaigns: any[]; total?: number }> =>
    apiRequest('/campaigns', {
      method: 'GET',
      params,
    }),

  get: (id: string): Promise<{ success: boolean; campaign: any }> =>
    apiRequest(`/campaigns/${id}`, {
      method: 'GET',
    }),

  create: (data: any): Promise<{ success: boolean; campaign: any }> =>
    apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPosts: (campaignId: string): Promise<{ success: boolean; posts: any[] }> =>
    apiRequest(`/campaigns/${campaignId}/posts`, {
      method: 'GET',
    }),

  generatePlan: (campaignId: string, body = {}): Promise<{ success: boolean; campaign: any }> =>
    apiRequest(`/campaigns/${campaignId}/generate-plan`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 45000,
    }),

  generatePostContent: (postId: string, body = {}): Promise<{ success: boolean; post: any }> =>
    apiRequest(`/campaigns/posts/${postId}/generate-content`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 45000,
    }),

  updatePostStatus: (postId: string, status: string): Promise<{ success: boolean; post: any }> =>
    apiRequest(`/campaigns/posts/${postId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

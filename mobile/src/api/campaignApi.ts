import { apiRequest } from './client';

export const campaignApi = {
  list: (params: { workspaceId?: string; status?: string; page?: number; limit?: number } = {}): Promise<{ success: boolean; campaigns: any[]; total?: number }> =>
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

  update: (id: string, data: any): Promise<{ success: boolean; campaign: any }> =>
    apiRequest(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<{ success: boolean; message?: string }> =>
    apiRequest(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  getPosts: (campaignId: string, params: { status?: string; platform?: string } = {}): Promise<{ success: boolean; posts: any[]; total?: number }> =>
    apiRequest(`/campaigns/${campaignId}/posts`, {
      method: 'GET',
      params,
    }),

  generatePlan: (campaignId: string, body = {}): Promise<{ success: boolean; campaign?: any; posts?: any[]; message?: string }> =>
    apiRequest(`/campaigns/${campaignId}/generate-plan`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 60000,
    }),

  generateStrategy: (campaignId: string, body = {}): Promise<{ success: boolean; campaign?: any; strategy?: any }> =>
    apiRequest(`/campaigns/${campaignId}/generate-strategy`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 60000,
    }),

  generatePostContent: (postId: string, body = {}): Promise<{ success: boolean; post: any }> =>
    apiRequest(`/campaigns/posts/${postId}/generate-content`, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 60000,
    }),

  updatePost: (postId: string, data: any): Promise<{ success: boolean; post: any }> =>
    apiRequest(`/campaigns/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePostStatus: (postId: string, statusOrBody: string | { status: string; approvalStatus?: string }): Promise<{ success: boolean; post: any }> =>
    apiRequest(`/campaigns/posts/${postId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(typeof statusOrBody === 'string' ? { status: statusOrBody } : statusOrBody),
    }),

  calculateDates: (body: { startDate: string; endDate: string; frequency?: string }): Promise<{ success: boolean; dates: string[] }> =>
    apiRequest('/campaigns/dates/calculate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};


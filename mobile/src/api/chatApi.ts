import { apiRequest } from './client';

export const chatApi = {
  sendMessage: (payload: {
    message: string;
    sessionId?: string | null;
    model?: string;
    history?: Array<{ role: string; content: string }>;
    workspaceId?: string;
    userEmail?: string | null;
    userName?: string | null;
    brandContext?: string;
    systemInstruction?: string;
  }): Promise<{ success: boolean; response: string; reply?: string; sessionId?: string; error?: string }> =>
    apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    }),

  listSessions: (): Promise<{ success: boolean; sessions: any[] }> =>
    apiRequest('/chat/sessions', {
      method: 'GET',
    }),

  getSession: (sessionId: string): Promise<{ success: boolean; session: any }> =>
    apiRequest(`/chat/sessions/${sessionId}`, {
      method: 'GET',
    }),
};

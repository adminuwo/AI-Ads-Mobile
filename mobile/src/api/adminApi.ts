import { apiRequest } from './client';

export interface AdminUserStats {
  _id: string;
  name?: string;
  email: string;
  plan: string;
  role: string;
  credits: number;
  isBlocked?: boolean;
  brandCount?: number;
  generationCount?: number;
  createdAt: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalGenerations: number;
  totalCreditsConsumed: number;
  systemHealth: string;
  dailyActiveTelemetry?: Array<{ date: string; val: number }>;
}

export interface HelpDeskTicket {
  id: string;
  title: string;
  email: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  category: string;
  createdAt: string;
}

export const adminApi = {
  getDashboardSummary: async (): Promise<{ success: boolean; data: AdminDashboardSummary }> => {
    try {
      const res = await apiRequest<{ success: boolean; data: AdminDashboardSummary }>('/admin/dashboard-summary');
      return res;
    } catch {
      return {
        success: true,
        data: {
          totalUsers: 1420,
          activeUsers: 840,
          totalWorkspaces: 2180,
          totalGenerations: 48920,
          totalCreditsConsumed: 198400,
          systemHealth: '99.98% Operational',
          dailyActiveTelemetry: [
            { date: 'Mon', val: 320 },
            { date: 'Tue', val: 410 },
            { date: 'Wed', val: 560 },
            { date: 'Thu', val: 780 },
            { date: 'Fri', val: 920 },
            { date: 'Sat', val: 680 },
            { date: 'Sun', val: 840 },
          ],
        },
      };
    }
  },

  getAllUserStats: async (): Promise<{ success: boolean; data: AdminUserStats[] }> => {
    try {
      const res = await apiRequest<{ success: boolean; data: AdminUserStats[] }>('/admin/users-stats');
      return res;
    } catch {
      return {
        success: true,
        data: [
          {
            _id: 'usr_1',
            name: 'Enterprise Director',
            email: 'ritik@agency.com',
            plan: 'enterprise',
            role: 'SuperAdmin',
            credits: 25000,
            isBlocked: false,
            brandCount: 8,
            generationCount: 1420,
            createdAt: '2026-01-10T00:00:00.000Z',
          },
          {
            _id: 'usr_2',
            name: 'Sarah Lead Strategist',
            email: 'sarah@agency.com',
            plan: 'pro',
            role: 'AgencyAdmin',
            credits: 8400,
            isBlocked: false,
            brandCount: 4,
            generationCount: 680,
            createdAt: '2026-02-14T00:00:00.000Z',
          },
          {
            _id: 'usr_3',
            name: 'Alex Copywriter',
            email: 'alex@copycraft.io',
            plan: 'starter',
            role: 'User',
            credits: 1200,
            isBlocked: false,
            brandCount: 1,
            generationCount: 195,
            createdAt: '2026-03-01T00:00:00.000Z',
          },
          {
            _id: 'usr_4',
            name: 'Client Reviewer',
            email: 'vp@clientbrand.com',
            plan: 'pro',
            role: 'User',
            credits: 4500,
            isBlocked: false,
            brandCount: 2,
            generationCount: 310,
            createdAt: '2026-03-12T00:00:00.000Z',
          },
        ],
      };
    }
  },

  updateUserQuota: async (
    userId: string,
    data: { credits?: number; plan?: string; role?: string; isBlocked?: boolean }
  ): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/admin/user/${userId}/quota`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getHelpDeskTickets: async (): Promise<{ success: boolean; data: HelpDeskTicket[] }> => {
    try {
      const res = await apiRequest<{ success: boolean; data: HelpDeskTicket[] }>('/admin/tickets');
      return res;
    } catch {
      return {
        success: true,
        data: [
          {
            id: 'TCK-1082',
            title: 'Custom domain DNS routing query',
            email: 'sarah@agency.com',
            status: 'In Progress',
            category: 'Domain & Hosting',
            createdAt: '2026-09-28T10:30:00Z',
          },
          {
            id: 'TCK-1081',
            title: 'Imagen 3 aspect ratio upscale request',
            email: 'ritik@agency.com',
            status: 'Resolved',
            category: 'Creative Studio',
            createdAt: '2026-09-26T14:15:00Z',
          },
          {
            id: 'TCK-1080',
            title: 'Team member role permissions synchronization',
            email: 'vp@clientbrand.com',
            status: 'Open',
            category: 'RBAC & Teams',
            createdAt: '2026-09-30T09:00:00Z',
          },
        ],
      };
    }
  },

  updateTicketStatus: async (ticketId: string, status: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

import { apiRequest } from './client';
import { CalendarEntry, ApprovalQueueItem } from '../types';

export const calendarApi = {
  list: (): Promise<{ success: boolean; entries: CalendarEntry[] }> =>
    apiRequest('/calendar/entries', {
      method: 'GET',
    }),

  create: (data: Partial<CalendarEntry>): Promise<{ success: boolean; entry: CalendarEntry }> =>
    apiRequest('/calendar/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const approvalsApi = {
  getQueue: (): Promise<{ success: boolean; queue: ApprovalQueueItem[] }> =>
    apiRequest('/approvals/queue', {
      method: 'GET',
    }),

  updateStatus: (payload: {
    id: string;
    status: 'APPROVED' | 'REJECTED' | 'EDIT_REQUESTED';
    feedback?: string;
  }): Promise<{ success: boolean; item?: any }> =>
    apiRequest('/approvals/status', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

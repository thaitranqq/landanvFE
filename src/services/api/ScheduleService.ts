import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { ScheduleDTO } from '../../types/api';

export interface NotificationPreference {
  channel: 'PUSH' | 'EMAIL' | 'SMS';
  enabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;   // HH:mm format
}

export interface ScheduleCreateRequest {
  productId: number;
  cronExpr: string;
  channel: string;
  description?: string;
}

class ScheduleService {
  async getSchedules(): Promise<ScheduleDTO[]> {
    const response = await apiService.get<ScheduleDTO[]>(API_ENDPOINTS.SCHEDULES.BASE);
    return response.data || [];
  }

  async createSchedule(schedule: ScheduleCreateRequest): Promise<ScheduleDTO> {
    const response = await apiService.post<ScheduleDTO>(API_ENDPOINTS.SCHEDULES.BASE, schedule);
    return response.data!;
  }

  async updateSchedule(scheduleId: number, update: Partial<ScheduleDTO>): Promise<ScheduleDTO> {
    const response = await apiService.put<ScheduleDTO>(`${API_ENDPOINTS.SCHEDULES.BASE}/${scheduleId}`, update);
    return response.data!;
  }

  async deleteSchedule(scheduleId: number): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.SCHEDULES.BASE}/${scheduleId}`);
  }

  async getProductSchedules(productId: number): Promise<ScheduleDTO[]> {
    const response = await apiService.get<ScheduleDTO[]>(`${API_ENDPOINTS.SCHEDULES.BASE}/product/${productId}`);
    return response.data || [];
  }

  async updateNotificationPreferences(preferences: NotificationPreference[]): Promise<NotificationPreference[]> {
    const response = await apiService.put<NotificationPreference[]>(
      API_ENDPOINTS.SCHEDULES.NOTIFICATIONS,
      { preferences }
    );
    return response.data || [];
  }

  async getUpcomingNotifications(days: number = 7): Promise<{
    scheduleId: number;
    productId: number;
    nextOccurrence: string;
    channel: string;
  }[]> {
    const response = await apiService.get<{
      scheduleId: number;
      productId: number;
      nextOccurrence: string;
      channel: string;
    }[]>(`${API_ENDPOINTS.SCHEDULES.NOTIFICATIONS}/upcoming?days=${days}`);
    return response.data ?? [];
  }

  async generateOptimalSchedule(params: {
    products: number[];
    preferredTimes?: { morning?: string; evening?: string };
    constraints?: {
      maxDailyProducts?: number;
      minTimeBetweenProducts?: number;
    };
  }): Promise<{
    schedules: ScheduleDTO[];
    reasoning: string[];
  }> {
    const response = await apiService.post<{
      schedules: ScheduleDTO[];
      reasoning: string[];
    }>(`${API_ENDPOINTS.SCHEDULES.BASE}/optimize`, params);
    return response.data ?? { schedules: [], reasoning: [] };
  }
}

export const scheduleService = new ScheduleService();

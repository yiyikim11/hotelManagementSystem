import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export interface RatePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface RatePlanRequest {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DailyRoomRateResponse {
  id: string;
  ratePlanId: string;
  ratePlanCode: string;
  roomTypeId: string;
  roomTypeCode: string;
  rateDate: string;
  rate: number;
}

export interface DailyRoomRateRequest {
  ratePlanId: string;
  roomTypeId: string;
  rateDate: string;
  rate: number;
}

export const ratePlansApi = {
  list: (page = 0, size = 100) =>
    api.get<Page<RatePlan>>(`/pms/rate-plans?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  get: (id: string) => api.get<RatePlan>(`/pms/rate-plans/${id}`),

  create: (data: RatePlanRequest) => api.post<RatePlan>('/pms/rate-plans', data),

  update: (id: string, data: RatePlanRequest) =>
    api.put<RatePlan>(`/pms/rate-plans/${id}`, data),

  delete: (id: string) => api.delete<void>(`/pms/rate-plans/${id}`),

  getRates: (id: string, roomTypeId: string, from: string, to: string) =>
    api.get<DailyRoomRateResponse[]>(
      `/pms/rate-plans/${id}/rates?${new URLSearchParams({ roomTypeId, from, to })}`
    ),

  upsertRate: (data: DailyRoomRateRequest) =>
    api.post<DailyRoomRateResponse>('/pms/rate-plans/rates', data),
};

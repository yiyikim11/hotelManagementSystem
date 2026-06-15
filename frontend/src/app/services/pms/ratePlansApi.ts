import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export interface RatePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export const ratePlansApi = {
  list: (page = 0, size = 100) =>
    api.get<Page<RatePlan>>(`/pms/rate-plans?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  get: (id: string) => api.get<RatePlan>(`/pms/rate-plans/${id}`),
};

import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export type FeeType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIRST_NIGHT';

export interface CancellationPolicy {
  id: string;
  code: string;
  name: string;
  description: string | null;
  hoursBeforeArrival: number;
  feeType: FeeType;
  feeValue: number;
  isActive: boolean;
}

export interface CancellationPolicyRequest {
  code: string;
  name: string;
  description?: string;
  hoursBeforeArrival: number;
  feeType: FeeType;
  feeValue: number;
  isActive: boolean;
}

export const cancellationPoliciesApi = {
  list: (page = 0, size = 100) =>
    api.get<Page<CancellationPolicy>>(
      `/pms/cancellation-policies?${new URLSearchParams({ page: String(page), size: String(size) })}`
    ),

  get: (id: string) => api.get<CancellationPolicy>(`/pms/cancellation-policies/${id}`),

  create: (data: CancellationPolicyRequest) =>
    api.post<CancellationPolicy>('/pms/cancellation-policies', data),

  update: (id: string, data: CancellationPolicyRequest) =>
    api.put<CancellationPolicy>(`/pms/cancellation-policies/${id}`, data),

  delete: (id: string) => api.delete<void>(`/pms/cancellation-policies/${id}`),
};

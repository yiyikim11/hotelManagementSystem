import { api } from '../../lib/apiClient';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  nationality: string | null;
  idType: string | null;
  idNumber: string | null;
  issuingCountry: string | null;
  preferences: string | null;
  totalStays: number;
  totalSpent: number;
  vipStatus: boolean;
  blacklisted: boolean;
}

export interface GuestRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  issuingCountry?: string;
  preferences?: string;
  vipStatus: boolean;
  blacklisted: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const guestsApi = {
  list: (page = 0, size = 20) =>
    api.get<Page<Guest>>(`/pms/guests?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  search: (q: string, page = 0, size = 20) =>
    api.get<Page<Guest>>(`/pms/guests?${new URLSearchParams({ q, page: String(page), size: String(size) })}`),

  get: (id: string) => api.get<Guest>(`/pms/guests/${id}`),

  create: (data: GuestRequest) => api.post<Guest>('/pms/guests', data),

  update: (id: string, data: GuestRequest) => api.put<Guest>(`/pms/guests/${id}`, data),

  delete: (id: string) => api.delete<void>(`/pms/guests/${id}`),
};

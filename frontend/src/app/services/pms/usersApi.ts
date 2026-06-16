import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string | null;
  department: string | null;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  roleId?: string;
  department?: string;
}

export const usersApi = {
  list: (page = 0, size = 50) =>
    api.get<Page<UserResponse>>(`/admin/users?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  get: (id: string) => api.get<UserResponse>(`/admin/users/${id}`),

  create: (data: CreateUserRequest) => api.post<UserResponse>('/admin/users', data),

  activate: (id: string) => api.patch<UserResponse>(`/admin/users/${id}/activate`),

  deactivate: (id: string) => api.patch<UserResponse>(`/admin/users/${id}/deactivate`),
};

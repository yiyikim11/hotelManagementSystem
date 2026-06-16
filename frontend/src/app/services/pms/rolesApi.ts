import { api } from '../../lib/apiClient';

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export const rolesApi = {
  list: () => api.get<RoleResponse[]>('/admin/roles'),
};

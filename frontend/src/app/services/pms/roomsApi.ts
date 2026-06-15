import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_ORDER' | 'OUT_OF_SERVICE' | 'MAINTENANCE';

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeCode: string;
  floor: number | null;
  status: RoomStatus;
  notes: string | null;
}

export interface RoomRequest {
  roomNumber: string;
  roomTypeId: string;
  floor?: number;
  status: RoomStatus;
  notes?: string;
}

export const roomsApi = {
  list: (page = 0, size = 100) =>
    api.get<Page<Room>>(`/pms/rooms?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  get: (id: string) => api.get<Room>(`/pms/rooms/${id}`),

  create: (data: RoomRequest) => api.post<Room>('/pms/rooms', data),

  update: (id: string, data: RoomRequest) => api.put<Room>(`/pms/rooms/${id}`, data),

  updateStatus: (id: string, status: RoomStatus) =>
    api.patch<Room>(`/pms/rooms/${id}/status`, { status }),

  delete: (id: string) => api.delete<void>(`/pms/rooms/${id}`),
};

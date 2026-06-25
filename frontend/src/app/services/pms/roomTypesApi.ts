import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export interface RoomType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  baseOccupancy: number;
  maxOccupancy: number;
  baseRate: number;
  currency: string;
  archived: boolean;
}

export interface RoomTypeRequest {
  code: string;
  name: string;
  description?: string;
  baseOccupancy: number;
  maxOccupancy: number;
  baseRate: number;
  currency?: string;
}

export interface AvailabilityItem {
  roomTypeId: string;
  roomTypeCode: string;
  roomTypeName: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  baseRate: number;
}

export const roomTypesApi = {
  list: (page = 0, size = 100, includeArchived = false) =>
    api.get<Page<RoomType>>(
      `/pms/room-types?${new URLSearchParams({
        page: String(page),
        size: String(size),
        includeArchived: String(includeArchived),
      })}`
    ),

  get: (id: string) => api.get<RoomType>(`/pms/room-types/${id}`),

  create: (data: RoomTypeRequest) => api.post<RoomType>('/pms/room-types', data),

  update: (id: string, data: RoomTypeRequest) => api.put<RoomType>(`/pms/room-types/${id}`, data),

  delete: (id: string) => api.delete<void>(`/pms/room-types/${id}`),

  restore: (id: string) => api.post<RoomType>(`/pms/room-types/${id}/restore`, {}),

  availability: (from: string, to: string) =>
    api.get<AvailabilityItem[]>(`/pms/room-types/availability?${new URLSearchParams({ from, to })}`),

  listPublic: () =>
    api.get<PublicRoomType[]>(`/public/room-types`),

  getPublic: (id: string) =>
    api.get<PublicRoomType>(`/public/room-types/${id}`),

  availabilityPublic: (from: string, to: string) =>
    api.get<AvailabilityItem[]>(`/public/room-types/availability?${new URLSearchParams({ from, to })}`),
};

export interface PublicRoomType extends RoomType {
  websiteDescription: string | null;
  websitePhotos: string[];
  displayOrder: number | null;
  promotionalRate: number | null;
  promotionalRateDescription: string | null;
  featuredAmenities: string[];
}

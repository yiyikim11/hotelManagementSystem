import { api } from '../../lib/apiClient';

export interface WebsiteRoomListing {
  id: string | null;
  roomTypeId: string;
  isPublished: boolean;
  websiteDescription: string | null;
  websitePhotos: string[];
  displayOrder: number;
  promotionalRate: number | null;
  promotionalRateDescription: string | null;
  featuredAmenities: string[];
  updatedAt: string | null;
}

export interface WebsiteRoomListingPayload {
  isPublished?: boolean;
  websiteDescription?: string | null;
  websitePhotos?: string[];
  displayOrder?: number;
  promotionalRate?: number | null;
  promotionalRateDescription?: string | null;
  featuredAmenities?: string[];
}

export const websiteListingsApi = {
  list: () => api.get<WebsiteRoomListing[]>('/booking/website-listings'),
  upsert: (roomTypeId: string, payload: WebsiteRoomListingPayload) =>
    api.put<WebsiteRoomListing>(`/booking/website-listings/${roomTypeId}`, payload),
  toggle: (roomTypeId: string) =>
    api.post<WebsiteRoomListing>(`/booking/website-listings/${roomTypeId}/toggle`, {}),
};

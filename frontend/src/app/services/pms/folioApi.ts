import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export type FolioStatus = 'OPEN' | 'CLOSED';
export type ChargeType =
  | 'ROOM' | 'TAX' | 'FOOD' | 'MINIBAR' | 'LAUNDRY'
  | 'SPA' | 'PARKING' | 'OTHER' | 'CANCELLATION_FEE';

export interface FolioItem {
  id: string;
  chargeType: ChargeType;
  description: string | null;
  amount: number;
  quantity: number;
  unitPrice: number;
  postedById: string | null;
  postedAt: string;
  voidedById: string | null;
  voidedAt: string | null;
}

export interface Folio {
  id: string;
  reservationId: string | null;
  confirmationNumber: string | null;
  guestId: string | null;
  guestName: string | null;
  status: FolioStatus;
  totalAmount: number;
  paidAmount: number;
  settledAt: string | null;
  items: FolioItem[];
}

export interface PostChargeRequest {
  chargeType: ChargeType;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export const folioApi = {
  list: (page = 0, size = 20) =>
    api.get<Page<Folio>>(`/pms/folios?${new URLSearchParams({ page: String(page), size: String(size) })}`),

  getByReservation: (reservationId: string) =>
    api.get<Folio>(`/pms/folios/by-reservation/${reservationId}`),

  openForReservation: (reservationId: string) =>
    api.post<Folio>(`/pms/folios/by-reservation/${reservationId}/open`),

  postCharge: (id: string, request: PostChargeRequest) =>
    api.post<Folio>(`/pms/folios/${id}/charges`, request),

  voidItem: (id: string, itemId: string) =>
    api.delete<Folio>(`/pms/folios/${id}/charges/${itemId}`),

  close: (id: string) =>
    api.post<Folio>(`/pms/folios/${id}/close`),
};

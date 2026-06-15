import { api } from '../../lib/apiClient';
import type { Page } from './guestsApi';

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type ReservationSource = 'WALK_IN' | 'WEBSITE' | 'PHONE' | 'OTA' | 'CORPORATE';

export interface ReservationRoom {
  id: string;
  roomId: string | null;
  roomNumber: string | null;
  roomTypeId: string | null;
  roomTypeCode: string | null;
  cancellationPolicyId: string | null;
  arrivalDate: string;
  departureDate: string;
  nightlyRate: number;
  totalAmount: number;
  checkedInAt: string | null;
  checkedOutAt: string | null;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  guestId: string | null;
  guestName: string | null;
  status: ReservationStatus;
  source: ReservationSource;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  ratePlanId: string | null;
  ratePlanCode: string | null;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  currency: string;
  specialRequests: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  isDayUse: boolean;
  rooms: ReservationRoom[];
  createdAt: string;
}

export interface CreateReservationRequest {
  guestId: string;
  ratePlanId: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  source: ReservationSource;
  currency?: string;
  specialRequests?: string;
  isDayUse?: boolean;
  rooms: { roomTypeId: string; cancellationPolicyId?: string }[];
}

export const reservationsApi = {
  list: (status?: ReservationStatus, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    return api.get<Page<Reservation>>(`/pms/reservations?${params}`);
  },

  get: (id: string) => api.get<Reservation>(`/pms/reservations/${id}`),

  create: (data: CreateReservationRequest) =>
    api.post<Reservation>('/pms/reservations', data),

  checkIn: (id: string) => api.post<Reservation>(`/pms/reservations/${id}/check-in`),

  checkOut: (id: string) => api.post<Reservation>(`/pms/reservations/${id}/check-out`),

  cancel: (id: string, reason: string) =>
    api.post<Reservation>(`/pms/reservations/${id}/cancel`, { reason }),

  noShow: (id: string) => api.post<Reservation>(`/pms/reservations/${id}/no-show`),

  arrivals: (date: string) =>
    api.get<Reservation[]>(`/pms/reservations/arrivals?${new URLSearchParams({ date })}`),

  departures: (date: string) =>
    api.get<Reservation[]>(`/pms/reservations/departures?${new URLSearchParams({ date })}`),

  inHouse: (date: string) =>
    api.get<Reservation[]>(`/pms/reservations/in-house?${new URLSearchParams({ date })}`),
};

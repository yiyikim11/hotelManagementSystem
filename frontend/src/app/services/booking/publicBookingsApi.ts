import { api } from '../../lib/apiClient';
import type { Page } from '../pms/guestsApi';
import type { Reservation } from '../pms/reservationsApi';

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PublicBookingRequest {
  guest: GuestDetails;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  roomTypeId: string;
  ratePlanId?: string;
  promoCode?: string;
  specialRequests?: string;
}

export interface PublicBookingResponse {
  reservationId: string;
  confirmationNumber: string;
  totalAmount: number;
  currency: string;
}

export interface PromoValidateRequest {
  code: string;
  arrivalDate: string;
  departureDate: string;
  roomTypeId?: string;
}

export interface PromoValidateResponse {
  promoCodeId: string;
  packageId: string;
  packageCode: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minNights: number;
}

export interface PayRequest {
  gateway: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardBrand: string;
  cardLast4: string;
}

export const publicBookingsApi = {
  validatePromo: (req: PromoValidateRequest) =>
    api.post<PromoValidateResponse>('/public/promo/validate', req),

  create: (req: PublicBookingRequest) =>
    api.post<PublicBookingResponse>('/public/bookings', req),

  pay: (id: string, req: PayRequest) =>
    api.post<Reservation>(`/public/bookings/${id}/pay`, req),

  get: (id: string) =>
    api.get<Reservation>(`/public/bookings/${id}`),

  listByEmail: (email: string, page = 0, size = 20) =>
    api.get<Page<Reservation>>(
      `/public/bookings?${new URLSearchParams({ email, page: String(page), size: String(size) })}`
    ),

  cancel: (id: string, reason: string) =>
    api.post<Reservation>(`/public/bookings/${id}/cancel`, { reason }),
};

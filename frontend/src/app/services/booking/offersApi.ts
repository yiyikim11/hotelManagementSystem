import { api } from '../../lib/apiClient';

export interface Offer {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validTo: string;
  minNights: number;
  maxNights: number | null;
  isActive: boolean;
  roomTypeIds: string[];
  createdAt: string;
}

export const offersApi = {
  list: (params: { from?: string; to?: string; roomTypeId?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.roomTypeId) qs.set('roomTypeId', params.roomTypeId);
    const query = qs.toString();
    return api.get<Offer[]>(`/public/offers${query ? '?' + query : ''}`);
  },
};

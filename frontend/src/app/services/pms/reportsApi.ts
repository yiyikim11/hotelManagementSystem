import { api } from '../../lib/apiClient';

export interface DashboardData {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  arrivalsToday: number;
  departuresToday: number;
  inHouseGuests: number;
  confirmedReservations: number;
  revenueToday: number;
}

export interface OccupancyData {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export interface RevenueData {
  from: string;
  to: string;
  totalRevenue: number;
  roomRevenue: number;
  otherRevenue: number;
  totalFolios: number;
}

export const reportsApi = {
  dashboard: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return api.get<DashboardData>(`/pms/reports/dashboard${qs}`);
  },

  occupancy: (from: string, to: string) =>
    api.get<OccupancyData[]>(`/pms/reports/occupancy?${new URLSearchParams({ from, to })}`),

  revenue: (from: string, to: string) =>
    api.get<RevenueData>(`/pms/reports/revenue?${new URLSearchParams({ from, to })}`),
};

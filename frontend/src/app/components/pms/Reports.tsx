import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Download, TrendingUp, Users, DoorOpen, LogIn } from 'lucide-react';
import { reportsApi, type DashboardData, type OccupancyData, type RevenueData } from '../../services/pms/reportsApi';

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export default function PMSReports() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyData[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from30 = daysAgo(29);
      const to = today();
      const [dash, occ, rev] = await Promise.all([
        reportsApi.dashboard(),
        reportsApi.occupancy(from30, to),
        reportsApi.revenue(monthStart(), to),
      ]);
      setDashboard(dash);
      setOccupancy(occ);
      setRevenue(rev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const occupancyRate = dashboard
    ? dashboard.totalRooms > 0
      ? ((dashboard.occupiedRooms / dashboard.totalRooms) * 100).toFixed(1)
      : '0.0'
    : '—';

  const revenueToday = dashboard ? Number(dashboard.revenueToday).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const totalMTD = revenue ? Number(revenue.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const occupancyChartData = occupancy.slice(-14).map(o => ({
    date: o.date.slice(5),
    rate: Number(o.occupancyRate.toFixed(1)),
    occupied: o.occupiedRooms,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Dashboard</h1>
          <p className="text-gray-600 mt-1">Occupancy, revenue analytics, and forecasts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      )}

      {!loading && dashboard && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{occupancyRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboard.occupiedRooms} / {dashboard.totalRooms} rooms</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In-House Guests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard.inHouseGuests}</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboard.availableRooms} rooms available</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Arrivals Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard.arrivalsToday}</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboard.departuresToday} departures</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">${revenueToday}</p>
                  <p className="text-xs text-gray-500 mt-1">MTD: ${totalMTD}</p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <DoorOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">14-Day Occupancy Rate (%)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} name="Occupancy %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">14-Day Occupied Rooms</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupied" fill="#10b981" name="Occupied Rooms" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Breakdown (MTD) */}
          {revenue && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown (Month-to-Date)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Room Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${Number(revenue.roomRevenue).toFixed(0)}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {revenue.totalRevenue > 0
                      ? `${((revenue.roomRevenue / revenue.totalRevenue) * 100).toFixed(0)}%`
                      : '—'}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Other Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${Number(revenue.otherRevenue).toFixed(0)}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {revenue.totalRevenue > 0
                      ? `${((revenue.otherRevenue / revenue.totalRevenue) * 100).toFixed(0)}%`
                      : '—'}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total ({revenue.totalFolios} folios)</p>
                    <p className="text-2xl font-bold text-gray-900">${Number(revenue.totalRevenue).toFixed(0)}</p>
                  </div>
                  <div className="text-sm text-gray-600">100%</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

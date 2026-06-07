import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Home, DoorOpen } from 'lucide-react';
import { dataStore } from '../../data/store';

export default function PMSReports() {
  const reservations = dataStore.getReservations();
  const guests = dataStore.getGuests();
  const roomStatuses = dataStore.getRoomStatuses();
  const roomTypes = dataStore.getRoomTypes();

  const totalRooms = roomStatuses.length;
  const occupiedRooms = roomStatuses.filter(r => r.occupancyStatus === 'occupied').length;
  const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

  const totalRevenue = reservations.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalRevenueIncludingUnpaid = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const adr = totalRevenue / occupiedRooms || 0;
  const revPAR = totalRevenue / totalRooms || 0;

  const monthlyData = [
    { month: 'Jan', revenue: 45000, bookings: 120 },
    { month: 'Feb', revenue: 38000, bookings: 98 },
    { month: 'Mar', revenue: 52000, bookings: 145 },
    { month: 'Apr', revenue: 61000, bookings: 168 },
    { month: 'May', revenue: totalRevenue, bookings: reservations.length },
  ];

  // Calculate room occupancy by type
  const roomOccupancyByType = roomTypes.map(roomType => {
    const total = roomType.totalRooms;
    const occupied = roomStatuses.filter(
      rs => rs.type === roomType.name && rs.occupancyStatus === 'occupied'
    ).length;
    return {
      name: roomType.name,
      occupied,
      total,
      occupancyRate: ((occupied / total) * 100).toFixed(0)
    };
  });

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{occupancyRate}%</p>
              <p className="text-xs text-green-600 mt-1">↑ 5.2% from last month</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">ADR (Avg Daily Rate)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${adr.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Per occupied room</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">RevPAR</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${revPAR.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Revenue per available room</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Revenue (MTD)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12.3% from last month</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Room Occupancy by Type
          </h2>
          <div className="space-y-4">
            {roomOccupancyByType.map((room, index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', progress: 'bg-blue-500' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', progress: 'bg-green-500' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', progress: 'bg-purple-500' }
              ];
              const color = colors[index % colors.length];

              return (
                <div key={room.name} className={`p-4 ${color.bg} border ${color.border} rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DoorOpen className={`w-5 h-5 ${color.text}`} />
                      <span className={`font-semibold ${color.text}`}>{room.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${color.text}`}>
                        {room.occupied}/{room.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${color.progress} transition-all duration-500`}
                        style={{ width: `${room.occupancyRate}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${color.text} min-w-[3rem] text-right`}>
                      {room.occupancyRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {room.occupied} room{room.occupied !== 1 ? 's' : ''} occupied out of {room.total} total
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Room Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue * 0.75).toFixed(0)}</p>
              </div>
              <div className="text-sm text-gray-600">75%</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">F&B Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue * 0.15).toFixed(0)}</p>
              </div>
              <div className="text-sm text-gray-600">15%</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Other Services</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue * 0.10).toFixed(0)}</p>
              </div>
              <div className="text-sm text-gray-600">10%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Forecast */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">6-Month Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026'].map((month, idx) => {
            // Generate realistic forecast data with seasonal trends
            const baseOccupancy = 65;
            const seasonalVariation = idx === 1 || idx === 2 ? 15 : idx === 4 ? -10 : 0; // Summer peak, fall dip
            const forecastOccupancy = baseOccupancy + seasonalVariation + (Math.random() * 10 - 5);
            const forecastRevenue = (forecastOccupancy / 100) * 55000 * (1 + Math.random() * 0.2);

            return (
              <div key={month} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-gray-700 mb-2">{month}</p>
                <p className="text-2xl font-bold text-blue-600">{forecastOccupancy.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Occupancy</p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">Est. Revenue</p>
                  <p className="text-sm font-semibold text-gray-900">${(forecastRevenue / 1000).toFixed(1)}K</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium text-blue-900 mb-1">Forecast Insights:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Peak season expected in July-August with 80%+ occupancy</li>
            <li>Revenue projected to grow 8-12% compared to same period last year</li>
            <li>Consider special promotions for September-October to maintain occupancy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

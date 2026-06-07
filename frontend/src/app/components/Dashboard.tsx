import { Hotel, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { dataStore } from '../data/store';

export default function Dashboard() {
  const reservations = dataStore.getReservations();
  const guests = dataStore.getGuests();
  const charges = dataStore.getCharges();
  const roomStatuses = dataStore.getRoomStatuses();

  const checkedIn = reservations.filter(r => r.status === 'checked-in').length;
  const totalReservations = reservations.length;
  const totalGuests = guests.length;
  const totalRevenue = reservations.reduce((sum, r) => sum + r.paidAmount, 0);

  const totalRooms = roomStatuses.length;
  const occupiedRooms = roomStatuses.filter(r => r.occupancyStatus === 'occupied').length;
  const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

  const adr = totalRevenue / occupiedRooms || 0;
  const revPAR = totalRevenue / totalRooms || 0;

  const dirtyRooms = roomStatuses.filter(r => r.cleaningStatus === 'dirty').length;
  const outOfOrder = roomStatuses.filter(r => r.cleaningStatus === 'out-of-order').length;
  const pendingCharges = charges.filter(c => !c.isPaid).length;

  const stats = [
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Hotel, color: 'bg-blue-500' },
    { label: 'Checked In Today', value: checkedIn, icon: Calendar, color: 'bg-green-500' },
    { label: 'Total Guests', value: totalGuests, icon: Users, color: 'bg-purple-500' },
    { label: 'Revenue (MTD)', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
  ];

  const metrics = [
    { label: 'ADR (Average Daily Rate)', value: `$${adr.toFixed(2)}` },
    { label: 'RevPAR (Revenue per Available Room)', value: `$${revPAR.toFixed(2)}` },
    { label: 'Total Reservations', value: totalReservations },
    { label: 'Occupied Rooms', value: `${occupiedRooms}/${totalRooms}` },
  ];

  const alerts = [
    { type: 'warning', message: `${dirtyRooms} rooms need cleaning`, show: dirtyRooms > 0 },
    { type: 'error', message: `${outOfOrder} rooms out of order`, show: outOfOrder > 0 },
    { type: 'info', message: `${pendingCharges} pending charges to process`, show: pendingCharges > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hotel Management Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.some(a => a.show) && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {alerts.filter(a => a.show).map((alert, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              }`}>
                <AlertCircle className="w-5 h-5" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Performance Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">{metric.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reservations</h2>
          <div className="space-y-3">
            {reservations.slice(0, 5).map((res) => {
              const guest = guests.find(g => g.id === res.guestId);
              return (
                <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/40 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{guest?.firstName} {guest?.lastName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Room {res.roomNumber} • {res.checkIn} to {res.checkOut}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    res.status === 'checked-in' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    res.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200'
                  }`}>
                    {res.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Status Overview</h2>
          <div className="space-y-3">
            {[
              { status: 'Ready', count: roomStatuses.filter(r => r.cleaningStatus === 'ready').length, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
              { status: 'Clean', count: roomStatuses.filter(r => r.cleaningStatus === 'clean').length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
              { status: 'Dirty', count: dirtyRooms, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
              { status: 'Out of Order', count: outOfOrder, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/40 rounded-lg">
                <span className="text-gray-900 dark:text-white">{item.status}</span>
                <span className={`px-3 py-1 rounded-full font-medium ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

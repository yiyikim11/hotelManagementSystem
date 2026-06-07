import { useState } from 'react';
import { Plus, Calendar, Users, Edit2, X } from 'lucide-react';
import { dataStore } from '../../data/store';
import { TableReservation } from '../../types';
import FormModal from '../shared/FormModal';

export default function RestaurantReservations() {
  const [reservations, setReservations] = useState(dataStore.getTableReservations());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<TableReservation | null>(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    date: '',
    time: '',
    partySize: '2',
    tableNumber: '',
    specialRequests: ''
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': 'bg-blue-100 text-blue-700',
      'seated': 'bg-green-100 text-green-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
      'no-show': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today);
  const upcomingReservations = reservations.filter(r => r.date > today);

  const handleSubmit = () => {
    const newReservation: TableReservation = {
      id: `TR${String(reservations.length + 1).padStart(3, '0')}`,
      guestName: formData.guestName,
      guestPhone: formData.guestPhone,
      date: formData.date,
      time: formData.time,
      partySize: parseInt(formData.partySize),
      tableNumber: formData.tableNumber,
      status: 'confirmed',
      specialRequests: formData.specialRequests || undefined
    };

    setReservations([...reservations, newReservation]);
    dataStore.tableReservations.push(newReservation);
    setShowAddModal(false);
    setFormData({
      guestName: '',
      guestPhone: '',
      date: '',
      time: '',
      partySize: '2',
      tableNumber: '',
      specialRequests: ''
    });
  };

  const updateReservationStatus = (reservationId: string, newStatus: TableReservation['status']) => {
    const updatedReservations = reservations.map(r =>
      r.id === reservationId ? { ...r, status: newStatus } : r
    );
    setReservations(updatedReservations);

    const resIndex = dataStore.tableReservations.findIndex(r => r.id === reservationId);
    if (resIndex !== -1) {
      dataStore.tableReservations[resIndex].status = newStatus;
    }
  };

  const handleEdit = (reservation: TableReservation) => {
    setEditingReservation(reservation);
    setFormData({
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize.toString(),
      tableNumber: reservation.tableNumber,
      specialRequests: reservation.specialRequests || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingReservation) return;

    const updatedReservations = reservations.map(r =>
      r.id === editingReservation.id ? {
        ...r,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        tableNumber: formData.tableNumber,
        specialRequests: formData.specialRequests || undefined
      } : r
    );
    setReservations(updatedReservations);

    const resIndex = dataStore.tableReservations.findIndex(r => r.id === editingReservation.id);
    if (resIndex !== -1) {
      dataStore.tableReservations[resIndex] = {
        ...dataStore.tableReservations[resIndex],
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        tableNumber: formData.tableNumber,
        specialRequests: formData.specialRequests || undefined
      };
    }

    setShowEditModal(false);
    setEditingReservation(null);
    setFormData({
      guestName: '',
      guestPhone: '',
      date: '',
      time: '',
      partySize: '2',
      tableNumber: '',
      specialRequests: ''
    });
  };

  const handleCancel = (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    updateReservationStatus(reservationId, 'cancelled');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Table Reservations</h1>
          <p className="text-gray-600  mt-1">Manage restaurant table bookings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white  rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 ">Today's Reservations</p>
          <p className="text-3xl font-bold text-gray-900  mt-1">{todayReservations.length}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 ">Confirmed</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {todayReservations.filter(r => r.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 ">Seated</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {todayReservations.filter(r => r.status === 'seated').length}
          </p>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 ">Total Guests</p>
          <p className="text-3xl font-bold text-gray-900  mt-1">
            {todayReservations.reduce((sum, r) => sum + r.partySize, 0)}
          </p>
        </div>
      </div>

      {/* Today's Reservations */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Reservations</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.guestName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reservation.guestPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reservation.partySize} guests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.tableNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {reservation.specialRequests || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'seated')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Seat
                        </button>
                      )}
                      {reservation.status === 'seated' && (
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(reservation)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Reservations</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.guestName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reservation.guestPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.date} {reservation.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reservation.partySize} guests
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.tableNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {reservation.specialRequests || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Create Table Reservation"
        submitText="Create Reservation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Guest Name *</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              placeholder="+1-555-0000"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Party Size *</label>
              <input
                type="number"
                min="1"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Table Number *</label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                placeholder="e.g., T-05"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Any special requests or dietary restrictions..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Reservation Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingReservation(null);
        }}
        onSubmit={handleEditSubmit}
        title="Edit Table Reservation"
        submitText="Update Reservation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              placeholder="+1-555-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party Size *</label>
              <input
                type="number"
                min="1"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Number *</label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                placeholder="e.g., T-05"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Any special requests or dietary restrictions..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

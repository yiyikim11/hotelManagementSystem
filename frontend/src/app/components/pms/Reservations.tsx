import { useState } from 'react';
import { Plus, Search, Calendar, Users as UsersIcon, Eye, Edit2, DoorOpen, DoorClosed, Clock, Ban, AlertCircle, X } from 'lucide-react';
import { dataStore } from '../../data/store';
import { Reservation } from '../../types';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

export default function PMSReservations() {
  const [reservations, setReservations] = useState(dataStore.getReservations());
  const [guests] = useState(dataStore.getGuests());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const [formData, setFormData] = useState({
    guestId: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    totalAmount: '',
    paidAmount: '',
    specialRequests: ''
  });

  const [editData, setEditData] = useState({
    guestId: '',
    roomNumber: '',
    status: '' as Reservation['status'],
    specialRequests: '',
    cancellationReason: ''
  });

  const filteredReservations = reservations.filter(res => {
    const guest = guests.find(g => g.id === res.guestId);
    const matchesSearch = !searchTerm ||
      res.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    const matchesSource = filterSource === 'all' || res.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Status statistics
  const statusStats = {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    checkedIn: reservations.filter(r => r.status === 'checked-in').length,
    checkedOut: reservations.filter(r => r.status === 'checked-out').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    noShow: reservations.filter(r => r.status === 'no-show').length
  };


  const getStatusColor = (status: Reservation['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'checked-in': 'bg-green-100 text-green-700',
      'checked-out': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
      'no-show': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getSourceColor = (source: Reservation['source']) => {
    const colors = {
      'website': 'bg-blue-100 text-blue-700',
      'walk-in': 'bg-gray-100 text-gray-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const getSourceLabel = (source: Reservation['source']) => {
    const labels = {
      'website': 'Website',
      'walk-in': 'Walk-in'
    };
    return labels[source] || source;
  };

  const handleSubmit = () => {
    const newReservation: Reservation = {
      id: `RES${String(reservations.length + 1).padStart(3, '0')}`,
      guestId: formData.guestId,
      roomNumber: formData.roomNumber,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: parseInt(formData.adults),
      children: parseInt(formData.children),
      status: 'pending',
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount || '0'),
      specialRequests: formData.specialRequests,
      source: 'walk-in', // All manually created reservations default to walk-in
      createdAt: new Date().toISOString()
    };

    setReservations([...reservations, newReservation]);
    dataStore.reservations.push(newReservation);
    setShowAddModal(false);
    setFormData({
      guestId: '',
      roomNumber: '',
      checkIn: '',
      checkOut: '',
      adults: '2',
      children: '0',
      totalAmount: '',
      paidAmount: '',
      specialRequests: ''
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setEditData({
      guestId: reservation.guestId,
      roomNumber: reservation.roomNumber,
      status: reservation.status,
      specialRequests: reservation.specialRequests || '',
      cancellationReason: reservation.cancellationReason || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingReservation) return;

    const isCancelled = editData.status === 'cancelled';

    const updatedReservations = reservations.map(r =>
      r.id === editingReservation.id ? {
        ...r,
        guestId: editData.guestId,
        roomNumber: editData.roomNumber,
        status: editData.status,
        specialRequests: editData.specialRequests,
        cancellationReason: isCancelled ? (editData.cancellationReason.trim() || undefined) : r.cancellationReason,
        actualArrival: editData.status === 'checked-in' && !r.actualArrival
          ? new Date().toISOString().split('T')[0]
          : r.actualArrival,
        actualDeparture: editData.status === 'checked-out' && !r.actualDeparture
          ? new Date().toISOString().split('T')[0]
          : r.actualDeparture
      } : r
    );

    setReservations(updatedReservations);

    const resIndex = dataStore.reservations.findIndex(r => r.id === editingReservation.id);
    if (resIndex !== -1) {
      dataStore.reservations[resIndex] = {
        ...dataStore.reservations[resIndex],
        guestId: editData.guestId,
        roomNumber: editData.roomNumber,
        status: editData.status,
        specialRequests: editData.specialRequests,
        cancellationReason: isCancelled ? (editData.cancellationReason.trim() || undefined) : dataStore.reservations[resIndex].cancellationReason,
        actualArrival: editData.status === 'checked-in' && !dataStore.reservations[resIndex].actualArrival
          ? new Date().toISOString().split('T')[0]
          : dataStore.reservations[resIndex].actualArrival,
        actualDeparture: editData.status === 'checked-out' && !dataStore.reservations[resIndex].actualDeparture
          ? new Date().toISOString().split('T')[0]
          : dataStore.reservations[resIndex].actualDeparture
      };
    }

    setShowEditModal(false);
    setEditingReservation(null);
  };

  const handleCancel = (reservation: Reservation) => {
    if (reservation.status === 'cancelled') return;
    setCancelTarget(reservation);
    setCancellationReason('');
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;

    const updatedReservations = reservations.map(r =>
      r.id === cancelTarget.id ? { ...r, status: 'cancelled' as const, cancellationReason: cancellationReason.trim() || undefined } : r
    );
    setReservations(updatedReservations);

    const resIndex = dataStore.reservations.findIndex(r => r.id === cancelTarget.id);
    if (resIndex !== -1) {
      dataStore.reservations[resIndex].status = 'cancelled';
      dataStore.reservations[resIndex].cancellationReason = cancellationReason.trim() || undefined;
    }

    setCancelTarget(null);
    setCancellationReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Reservations</h1>
          <p className="text-gray-600  mt-1">Manage all bookings and reservations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
      </div>

      {/* Reservation Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-gray-600 ">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600 ">Confirmed</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{statusStats.confirmed}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <DoorOpen className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600 ">Checked-in</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{statusStats.checkedIn}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <DoorClosed className="w-5 h-5 text-gray-600 " />
            <p className="text-sm text-gray-600 ">Checked-out</p>
          </div>
          <p className="text-2xl font-bold text-gray-600 ">{statusStats.checkedOut}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-red-600" />
            <p className="text-sm text-gray-600 ">Cancelled</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{statusStats.cancelled}</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-gray-600 ">No-show</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{statusStats.noShow}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white  rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
            <input
              type="text"
              placeholder="Search by guest name, room number, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="walk-in">Walk-in</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white  rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50  border-b border-gray-200 ">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Check In/Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Occupancy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 ">
            {filteredReservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guestId);
              return (
                <tr key={reservation.id} className="hover:bg-gray-50 ">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                    {reservation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 ">
                      {guest?.firstName} {guest?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(reservation.source)}`}>
                      {getSourceLabel(reservation.source)}
                    </span>
                    {reservation.onlineBookingId && (
                      <div className="text-xs text-gray-500 mt-1">{reservation.onlineBookingId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                    {reservation.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900 ">
                      <Calendar className="w-4 h-4 text-gray-400 " />
                      <span>{reservation.checkIn}</span>
                      <span className="text-gray-400 ">→</span>
                      <span>{reservation.checkOut}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900 ">
                      <UsersIcon className="w-4 h-4 text-gray-400 " />
                      <span>{reservation.adults + reservation.children}</span>
                      <span className="text-xs text-gray-500 ">
                        ({reservation.adults}A, {reservation.children}C)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 ">${reservation.totalAmount}</div>
                      <div className="text-gray-500 ">Paid: ${reservation.paidAmount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewReservation(reservation)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(reservation)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(reservation)}
                        disabled={reservation.status === 'cancelled'}
                        className={`p-1 rounded ${
                          reservation.status === 'cancelled'
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Reservation Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Create New Reservation"
        submitText="Create Reservation"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Select Guest *</label>
            <select
              value={formData.guestId}
              onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a guest...</option>
              {guests.map(guest => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName} - {guest.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="101"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Check-in Date *</label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Check-out Date *</label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Adults *</label>
            <input
              type="number"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Children *</label>
            <input
              type="number"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: e.target.value })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Total Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="450.00"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Paid Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700  mb-2">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Early check-in, late check-out, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        title={`Edit Reservation ${editingReservation?.id}`}
        submitText="Save Changes"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Guest Name *</label>
            <select
              value={editData.guestId}
              onChange={(e) => setEditData({ ...editData, guestId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a guest...</option>
              {guests.map(guest => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName} - {guest.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Room Number *</label>
            <input
              type="text"
              value={editData.roomNumber}
              onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })}
              placeholder="101"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Status *</label>
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value as Reservation['status'] })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="checked-out">Checked-out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>

          {editData.status === 'cancelled' ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
              <textarea
                value={editData.cancellationReason}
                onChange={(e) => setEditData({ ...editData, cancellationReason: e.target.value })}
                placeholder="e.g. Guest request, no-show policy, overbooking..."
                rows={3}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Optional — leave blank if no reason is needed.</p>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-2">Special Requests</label>
              <textarea
                value={editData.specialRequests}
                onChange={(e) => setEditData({ ...editData, specialRequests: e.target.value })}
                placeholder="Early check-in, late check-out, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="md:col-span-2 p-3 bg-blue-50  border border-blue-200  rounded-lg text-sm text-gray-700 ">
            <p className="font-medium mb-1">Note:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Changing status to "Checked-in" will automatically set the actual arrival date to today</li>
              <li>Changing status to "Checked-out" will automatically set the actual departure date to today</li>
              <li>Check-in and check-out dates (expected dates) cannot be edited here</li>
            </ul>
          </div>
        </div>
      </FormModal>

      {/* View Reservation Modal */}
      {viewReservation && (
        <Modal
          isOpen={!!viewReservation}
          onClose={() => setViewReservation(null)}
          title={`Reservation ${viewReservation.id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 ">Guest</p>
                <p className="font-medium text-gray-900 ">
                  {guests.find(g => g.id === viewReservation.guestId)?.firstName}{' '}
                  {guests.find(g => g.id === viewReservation.guestId)?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 ">Room Number</p>
                <p className="font-medium text-gray-900 ">{viewReservation.roomNumber}</p>
              </div>
              {viewReservation.roomType && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 ">Room Type</p>
                  <p className="font-medium text-gray-900 ">{viewReservation.roomType}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200  pt-4">
              <h3 className="font-semibold text-gray-900  mb-3">Expected Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 ">Expected Arrival Date</p>
                  <p className="font-medium text-gray-900 ">{viewReservation.checkIn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 ">Expected Departure Date</p>
                  <p className="font-medium text-gray-900 ">{viewReservation.checkOut}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200  pt-4">
              <h3 className="font-semibold text-gray-900  mb-3">Actual Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 ">Actual Arrival Date</p>
                  <p className="font-medium text-gray-900 ">
                    {viewReservation.actualArrival || (
                      <span className="text-gray-400  italic">Not checked-in yet</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 ">Actual Departure Date</p>
                  <p className="font-medium text-gray-900 ">
                    {viewReservation.actualDeparture || (
                      <span className="text-gray-400  italic">Not checked-out yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200  pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 ">Occupancy</p>
                  <p className="font-medium text-gray-900 ">
                    {viewReservation.adults} Adult{viewReservation.adults !== 1 ? 's' : ''}, {viewReservation.children} Child{viewReservation.children !== 1 ? 'ren' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 ">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(viewReservation.status)}`}>
                    {viewReservation.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 ">Total Amount</p>
                  <p className="font-medium text-gray-900 ">${viewReservation.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 ">Paid Amount</p>
                  <p className="font-medium text-gray-900 ">${viewReservation.paidAmount}</p>
                </div>
              </div>
            </div>

            {viewReservation.specialRequests && (
              <div className="border-t border-gray-200  pt-4">
                <p className="text-sm text-gray-600  mb-1">Special Requests</p>
                <p className="text-gray-900 ">{viewReservation.specialRequests}</p>
              </div>
            )}

            {viewReservation.status === 'cancelled' && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-1">Cancellation Reason</p>
                {viewReservation.cancellationReason ? (
                  <p className="text-gray-900">{viewReservation.cancellationReason}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No reason provided</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 ">
              <p className="text-sm text-gray-600  mb-1">Created</p>
              <p className="text-gray-900 ">{new Date(viewReservation.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Reason Modal */}
      {cancelTarget && (
        <Modal
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          title="Cancel Reservation"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are cancelling reservation <span className="font-medium text-gray-900">{cancelTarget.id}</span>. Please provide a reason for cancellation.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Guest request, no-show policy, overbooking..."
                rows={3}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Optional — leave blank if no reason is needed.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

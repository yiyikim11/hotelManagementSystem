import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, Users as UsersIcon, Eye, DoorOpen, DoorClosed, Clock, Ban, AlertCircle, X } from 'lucide-react';
import { reservationsApi, type Reservation, type ReservationStatus, type CreateReservationRequest } from '../../services/pms/reservationsApi';
import { guestsApi, type Guest } from '../../services/pms/guestsApi';
import { roomTypesApi, type RoomType } from '../../services/pms/roomTypesApi';
import { ratePlansApi, type RatePlan } from '../../services/pms/ratePlansApi';
import Modal from '../shared/Modal';
import FormModal from '../shared/FormModal';

export default function PMSReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    guestId: string; ratePlanId: string; arrivalDate: string; departureDate: string;
    adults: string; children: string; source: string; specialRequests: string; roomTypeId: string;
  }>({
    guestId: '', ratePlanId: '', arrivalDate: '', departureDate: '',
    adults: '1', children: '0', source: 'WALK_IN', specialRequests: '', roomTypeId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await reservationsApi.list(filterStatus || undefined);
      setReservations(page.content);
      setTotalElements(page.totalElements);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([
      guestsApi.list(0, 200),
      roomTypesApi.list(0, 100),
    ]).then(([g, rt]) => {
      setGuests(g.content);
      setRoomTypes(rt.content);
    }).catch(() => {});

    ratePlansApi.list(0, 100).then(p => setRatePlans(p.content)).catch(() => {});
  }, []);

  const filtered = reservations.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.confirmationNumber.toLowerCase().includes(q) ||
      (r.guestName ?? '').toLowerCase().includes(q)
    );
  });

  const statusStats: Record<ReservationStatus, number> = {
    CONFIRMED: reservations.filter(r => r.status === 'CONFIRMED').length,
    CHECKED_IN: reservations.filter(r => r.status === 'CHECKED_IN').length,
    CHECKED_OUT: reservations.filter(r => r.status === 'CHECKED_OUT').length,
    CANCELLED: reservations.filter(r => r.status === 'CANCELLED').length,
    NO_SHOW: reservations.filter(r => r.status === 'NO_SHOW').length,
  };

  const statusColor: Record<ReservationStatus, string> = {
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CHECKED_IN: 'bg-green-100 text-green-700',
    CHECKED_OUT: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-orange-100 text-orange-700',
  };

  const handleCheckIn = async (r: Reservation) => {
    try {
      await reservationsApi.checkIn(r.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-in failed');
    }
  };

  const handleCheckOut = async (r: Reservation) => {
    try {
      await reservationsApi.checkOut(r.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-out failed');
    }
  };

  const handleNoShow = async (r: Reservation) => {
    try {
      await reservationsApi.noShow(r.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No-show failed');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await reservationsApi.cancel(cancelTarget.id, cancellationReason || 'Cancelled');
      setCancelTarget(null);
      setCancellationReason('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancellation failed');
    }
  };

  const handleCreate = async () => {
    const req: CreateReservationRequest = {
      guestId: formData.guestId,
      ratePlanId: formData.ratePlanId,
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
      adults: parseInt(formData.adults),
      children: parseInt(formData.children),
      source: formData.source as CreateReservationRequest['source'],
      specialRequests: formData.specialRequests || undefined,
      rooms: [{ roomTypeId: formData.roomTypeId }],
    };
    try {
      await reservationsApi.create(req);
      setShowAddModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create reservation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage all bookings ({totalElements} total)</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> New Reservation
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {([
          { key: 'CONFIRMED', label: 'Confirmed', icon: Calendar, color: 'text-blue-600' },
          { key: 'CHECKED_IN', label: 'Checked-in', icon: DoorOpen, color: 'text-green-600' },
          { key: 'CHECKED_OUT', label: 'Checked-out', icon: DoorClosed, color: 'text-gray-600' },
          { key: 'CANCELLED', label: 'Cancelled', icon: Ban, color: 'text-red-600' },
          { key: 'NO_SHOW', label: 'No-show', icon: AlertCircle, color: 'text-orange-600' },
        ] as const).map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-sm text-gray-600">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{statusStats[key]}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by confirmation # or guest…"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ReservationStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">All Statuses</option>
          {(['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'] as ReservationStatus[]).map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Confirmation #', 'Guest', 'Status', 'Dates', 'Occupancy', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{r.confirmationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.guestName ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColor[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{r.arrivalDate}</span>
                      <span className="text-gray-400">→</span>
                      <span>{r.departureDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span>{r.adults}A, {r.children}C</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(r.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewReservation(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      {r.status === 'CONFIRMED' && (
                        <>
                          <button onClick={() => handleCheckIn(r)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Check In"><DoorOpen className="w-4 h-4" /></button>
                          <button onClick={() => handleNoShow(r)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="No Show"><AlertCircle className="w-4 h-4" /></button>
                          <button onClick={() => { setCancelTarget(r); setCancellationReason(''); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      {r.status === 'CHECKED_IN' && (
                        <button onClick={() => handleCheckOut(r)} className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="Check Out"><DoorClosed className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No reservations found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View modal */}
      {viewReservation && (
        <Modal isOpen onClose={() => setViewReservation(null)} title={`Reservation ${viewReservation.confirmationNumber}`} size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Guest', viewReservation.guestName],
              ['Status', viewReservation.status.replace('_', ' ')],
              ['Source', viewReservation.source.replace('_', ' ')],
              ['Rate Plan', viewReservation.ratePlanCode],
              ['Arrival', viewReservation.arrivalDate],
              ['Departure', viewReservation.departureDate],
              ['Adults', String(viewReservation.adults)],
              ['Children', String(viewReservation.children)],
              ['Total', `$${Number(viewReservation.totalAmount).toFixed(2)}`],
              ['Paid', `$${Number(viewReservation.paidAmount).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500">{label}</p>
                <p className="font-medium text-gray-900">{value ?? '—'}</p>
              </div>
            ))}
            {viewReservation.specialRequests && (
              <div className="col-span-2">
                <p className="text-gray-500">Special Requests</p>
                <p className="text-gray-900">{viewReservation.specialRequests}</p>
              </div>
            )}
            {viewReservation.cancellationReason && (
              <div className="col-span-2">
                <p className="text-gray-500">Cancellation Reason</p>
                <p className="text-gray-900">{viewReservation.cancellationReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <Modal isOpen onClose={() => setCancelTarget(null)} title="Cancel Reservation" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Cancelling <span className="font-medium">{cancelTarget.confirmationNumber}</span>. Provide a reason:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Reason for cancellation…"
              rows={3} autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none text-sm"
            />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCancelTarget(null)} className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Keep</button>
              <button onClick={handleConfirmCancel} className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Confirm Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create modal */}
      <FormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate} title="New Reservation" submitText="Create" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest *</label>
            <select value={formData.guestId} onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
              <option value="">Select guest…</option>
              {guests.map(g => <option key={g.id} value={g.id}>{g.firstName} {g.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Plan *</label>
            <select value={formData.ratePlanId} onChange={(e) => setFormData({ ...formData, ratePlanId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
              <option value="">Select rate plan…</option>
              {ratePlans.map(rp => <option key={rp.id} value={rp.id}>{rp.name} ({rp.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
            <select value={formData.roomTypeId} onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
              <option value="">Select room type…</option>
              {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {['WALK_IN', 'WEBSITE', 'PHONE', 'OTA', 'CORPORATE'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date *</label>
            <input type="date" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
            <input type="date" value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults *</label>
            <input type="number" min="1" value={formData.adults} onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
            <input type="number" min="0" value={formData.children} onChange={(e) => setFormData({ ...formData, children: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, XCircle, RefreshCw } from 'lucide-react';
import { reservationsApi, type Reservation } from '../../services/pms/reservationsApi';
import FormModal from '../shared/FormModal';

const todayStr = () => new Date().toISOString().split('T')[0];

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-green-100 text-green-700',
  CHECKED_OUT: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

const CANCEL_REASONS = [
  'Guest Request',
  'No Show',
  'Overbooking',
  'Payment Issue',
  'Emergency',
  'Other',
];

function roomLabel(res: Reservation) {
  const room = res.rooms[0];
  if (!room) return '—';
  const parts: string[] = [];
  if (room.roomNumber) parts.push(`Room ${room.roomNumber}`);
  if (room.roomTypeCode) parts.push(room.roomTypeCode);
  return parts.join(' · ') || '—';
}

export default function PMSFrontOffice() {
  const today = useMemo(() => todayStr(), []);

  const [arrivals, setArrivals] = useState<Reservation[]>([]);
  const [departures, setDepartures] = useState<Reservation[]>([]);
  const [confirmedList, setConfirmedList] = useState<Reservation[]>([]);
  const [checkedInList, setCheckedInList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [arr, dep, conf, ci] = await Promise.all([
        reservationsApi.arrivals(today),
        reservationsApi.departures(today),
        reservationsApi.list('CONFIRMED'),
        reservationsApi.list('CHECKED_IN'),
      ]);
      setArrivals(arr);
      setDepartures(dep);
      setConfirmedList(conf.content);
      setCheckedInList(ci.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load front office data');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async (id: string) => {
    setError('');
    try {
      await reservationsApi.checkIn(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-in failed');
    }
  };

  const handleCheckOut = async (id: string) => {
    setError('');
    try {
      await reservationsApi.checkOut(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-out failed');
    }
  };

  const handleCheckInSubmit = async () => {
    if (!selectedId) return;
    await handleCheckIn(selectedId);
    setShowCheckInModal(false);
    setSelectedId('');
  };

  const handleCheckOutSubmit = async () => {
    if (!selectedId) return;
    await handleCheckOut(selectedId);
    setShowCheckOutModal(false);
    setSelectedId('');
  };

  const handleCancelSubmit = async () => {
    if (!selectedId || !cancelReason) return;
    setError('');
    try {
      await reservationsApi.cancel(selectedId, cancelReason);
      setShowCancelModal(false);
      setSelectedId('');
      setCancelReason('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancellation failed');
    }
  };

  const selectedCheckInRes = showCheckInModal ? confirmedList.find(r => r.id === selectedId) : null;
  const selectedCheckOutRes = showCheckOutModal ? checkedInList.find(r => r.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Front Office Operations</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Check-in, check-out, and reservation management</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => { setSelectedId(''); setShowCheckInModal(true); }}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-green-500 p-3 rounded-full">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Check-In</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Process arrival</span>
        </button>

        <button
          onClick={() => { setSelectedId(''); setShowCheckOutModal(true); }}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-blue-500 p-3 rounded-full">
            <LogOut className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Check-Out</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Process departure</span>
        </button>

        <button
          onClick={() => { setSelectedId(''); setCancelReason(''); setShowCancelModal(true); }}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-red-500 p-3 rounded-full">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Cancellations</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Cancel reservation</span>
        </button>
      </div>

      {/* In-House Summary */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Summary — {today}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{checkedInList.length}</p>
            <p className="text-sm text-gray-500 mt-1">In-House</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{arrivals.filter(r => r.status === 'CONFIRMED').length}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Arrivals</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">{departures.filter(r => r.status === 'CHECKED_IN').length}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Departures</p>
          </div>
        </div>
      </div>

      {/* Arrivals & Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Arrivals</h2>
          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading…</p>
          ) : (
            <div className="space-y-3">
              {arrivals.map((res) => (
                <div
                  key={res.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    res.status === 'CANCELLED' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {res.guestName ?? res.confirmationNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {roomLabel(res)} · {res.adults + res.children} guests
                    </p>
                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${STATUS_BADGE[res.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABEL[res.status] ?? res.status}
                    </span>
                  </div>
                  <div>
                    {res.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCheckIn(res.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        Check In
                      </button>
                    )}
                    {res.status === 'CHECKED_IN' && (
                      <span className="px-3 py-1 bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-sm rounded-full">
                        Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {arrivals.length === 0 && (
                <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No arrivals scheduled for today</p>
              )}
            </div>
          )}
        </div>

        {/* Today's Departures */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Departures</h2>
          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading…</p>
          ) : (
            <div className="space-y-3">
              {departures.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {res.guestName ?? res.confirmationNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{roomLabel(res)}</p>
                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${STATUS_BADGE[res.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABEL[res.status] ?? res.status}
                    </span>
                  </div>
                  <div>
                    {res.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleCheckOut(res.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Check Out
                      </button>
                    )}
                    {res.status === 'CHECKED_OUT' && (
                      <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                        Checked Out
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {departures.length === 0 && (
                <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No departures scheduled for today</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-In Modal */}
      <FormModal
        isOpen={showCheckInModal}
        onClose={() => { setShowCheckInModal(false); setSelectedId(''); }}
        onSubmit={handleCheckInSubmit}
        title="Guest Check-In"
        submitText="Confirm Check-In"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation…</option>
              {confirmedList.map(res => (
                <option key={res.id} value={res.id}>
                  {res.confirmationNumber} — {res.guestName ?? '—'} — {res.arrivalDate}
                </option>
              ))}
            </select>
          </div>
          {selectedCheckInRes && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm space-y-1">
              <p><span className="text-gray-500">Confirmation:</span> <strong>{selectedCheckInRes.confirmationNumber}</strong></p>
              <p><span className="text-gray-500">Guest:</span> {selectedCheckInRes.guestName ?? '—'}</p>
              <p><span className="text-gray-500">Room:</span> {roomLabel(selectedCheckInRes)}</p>
              <p><span className="text-gray-500">Stay:</span> {selectedCheckInRes.arrivalDate} → {selectedCheckInRes.departureDate}</p>
              <p><span className="text-gray-500">Adults / Children:</span> {selectedCheckInRes.adults} / {selectedCheckInRes.children}</p>
              <p><span className="text-gray-500">Total:</span> ${Number(selectedCheckInRes.totalAmount).toFixed(2)}</p>
              {selectedCheckInRes.specialRequests && (
                <p><span className="text-gray-500">Special Requests:</span> {selectedCheckInRes.specialRequests}</p>
              )}
            </div>
          )}
        </div>
      </FormModal>

      {/* Check-Out Modal */}
      <FormModal
        isOpen={showCheckOutModal}
        onClose={() => { setShowCheckOutModal(false); setSelectedId(''); }}
        onSubmit={handleCheckOutSubmit}
        title="Guest Check-Out"
        submitText="Confirm Check-Out"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation…</option>
              {checkedInList.map(res => (
                <option key={res.id} value={res.id}>
                  {res.confirmationNumber} — {res.guestName ?? '—'} — departs {res.departureDate}
                </option>
              ))}
            </select>
          </div>
          {selectedCheckOutRes && (() => {
            const balance = Number(selectedCheckOutRes.totalAmount) - Number(selectedCheckOutRes.paidAmount);
            return (
              <div className={`p-4 rounded-lg border text-sm space-y-1 ${balance > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                <p><span className="text-gray-500">Confirmation:</span> <strong>{selectedCheckOutRes.confirmationNumber}</strong></p>
                <p><span className="text-gray-500">Guest:</span> {selectedCheckOutRes.guestName ?? '—'}</p>
                <p><span className="text-gray-500">Room:</span> {roomLabel(selectedCheckOutRes)}</p>
                <p><span className="text-gray-500">Stay:</span> {selectedCheckOutRes.arrivalDate} → {selectedCheckOutRes.departureDate}</p>
                <p>
                  <span className="text-gray-500">Total:</span> ${Number(selectedCheckOutRes.totalAmount).toFixed(2)}
                  {' '}· <span className="text-gray-500">Paid:</span> ${Number(selectedCheckOutRes.paidAmount).toFixed(2)}
                </p>
                {balance > 0 && (
                  <p className="font-medium text-orange-700 dark:text-orange-400">
                    Outstanding balance: ${balance.toFixed(2)} — please settle before check-out
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </FormModal>

      {/* Cancel Modal */}
      <FormModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setSelectedId(''); setCancelReason(''); }}
        onSubmit={handleCancelSubmit}
        title="Cancel Reservation"
        submitText="Confirm Cancellation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation…</option>
              {confirmedList.map(res => (
                <option key={res.id} value={res.id}>
                  {res.confirmationNumber} — {res.guestName ?? '—'} — {res.arrivalDate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cancellation Reason *</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reason…</option>
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {selectedId && cancelReason && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
              <p className="font-medium text-red-900 dark:text-red-300 mb-1">Warning</p>
              <p className="text-red-700 dark:text-red-300">
                This will permanently cancel the reservation and cannot be undone.
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}

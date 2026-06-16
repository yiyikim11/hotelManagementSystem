import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router';
import { CheckCircle, Calendar, Users, Mail, Printer, Home, AlertCircle, X, Loader } from 'lucide-react';
import { publicBookingsApi } from '../../services/booking/publicBookingsApi';
import type { Reservation } from '../../services/pms/reservationsApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateNights(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
}

export default function PublicConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Email is passed via navigation state from Checkout on the same session.
  const email = (location.state as { email?: string } | null)?.email ?? null;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError('');
      const res = await publicBookingsApi.get(bookingId);
      setReservation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking not found');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) { setCancelError('Please provide a reason.'); return; }
    if (!bookingId) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      const updated = await publicBookingsApi.cancel(bookingId, cancelReason.trim());
      setReservation(updated);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">{error || 'Booking not found'}</p>
          <Link to="/hotel" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const isCancelled = reservation.status === 'CANCELLED';
  const nights = calculateNights(reservation.arrivalDate, reservation.departureDate);
  const canCancel = reservation.status === 'CONFIRMED' &&
    new Date(reservation.arrivalDate) > new Date(new Date().toDateString());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Status banner */}
      {!isCancelled ? (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          {reservation.guestName && (
            <p className="text-lg text-gray-700 mb-2">Thank you for choosing Grand Hotel, {reservation.guestName}</p>
          )}
          {email && (
            <p className="text-gray-600">
              A confirmation email has been sent to <span className="font-medium">{email}</span>
            </p>
          )}
          <div className="mt-6 inline-block px-6 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Your Booking Reference</p>
            <p className="text-2xl font-bold text-blue-600">{reservation.confirmationNumber}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <X className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
          <p className="text-gray-600">Refund will be processed to your original payment method within 5–7 business days</p>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Booking Details</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Stay */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Stay Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p className="text-lg font-semibold">{formatDate(reservation.arrivalDate)}</p>
                <p className="text-sm text-gray-500 mt-1">After 3:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p className="text-lg font-semibold">{formatDate(reservation.departureDate)}</p>
                <p className="text-sm text-gray-500 mt-1">Before 11:00 AM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-semibold">{nights} Night{nights !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guests</p>
                  <p className="text-lg font-semibold">
                    {reservation.adults} adult{reservation.adults !== 1 ? 's' : ''}
                    {reservation.children > 0 && `, ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Guest Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {reservation.guestName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Name:</span>
                  <span className="font-medium">{reservation.guestName}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600 w-20">Email:</span>
                  <span className="font-medium">{email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">${reservation.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {isCancelled ? 'Cancelled – Refund Pending' : 'Fully Paid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Bring a valid photo ID at check-in</span></li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Free cancellation is available more than 24 hours before arrival</span></li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Contact us at +1 (555) 123-4567 for special requests or modifications</span></li>
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          <Printer className="w-5 h-5" /> Print Confirmation
        </button>
        <Link
          to="/hotel/my-bookings"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          View My Bookings
        </Link>
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            <X className="w-5 h-5" /> Cancel Booking
          </button>
        )}
        <Link
          to="/hotel"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          <Home className="w-5 h-5" /> Return to Home
        </Link>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Cancellation is allowed more than 24 hours before arrival. A refund will be processed within 5–7 business days.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
              <textarea
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Please tell us why you're cancelling…"
              />
              {cancelError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{cancelError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelError(''); }}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? <><Loader className="w-4 h-4 animate-spin" /> Cancelling…</> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

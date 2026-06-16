import { useState } from 'react';
import { Calendar, Mail, Search, AlertCircle, CheckCircle, Eye, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';
import { publicBookingsApi } from '../../services/booking/publicBookingsApi';
import type { Reservation } from '../../services/pms/reservationsApi';
import FormModal from '../shared/FormModal';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateNights(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-green-100 text-green-700',
  CHECKED_OUT: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
};

export default function PublicMyBookings() {
  const navigate = useNavigate();

  const [searchEmail, setSearchEmail] = useState('');
  const [results, setResults] = useState<Reservation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = searchEmail.trim();
    if (!email) { setSearchError('Please enter your email address'); return; }
    setIsSearching(true);
    setSearchError('');
    setHasSearched(false);
    try {
      const page = await publicBookingsApi.listByEmail(email);
      setResults(page.content);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const openCancelModal = (booking: Reservation) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setCancelError('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      setCancelError('Please provide a reason for cancellation');
      return;
    }
    setIsCancelling(true);
    setCancelError('');
    try {
      const updated = await publicBookingsApi.cancel(selectedBooking.id, cancelReason.trim());
      setResults(prev => prev.map(r => r.id === updated.id ? updated : r));
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = (r: Reservation) =>
    r.status === 'CONFIRMED' && new Date(r.arrivalDate) > new Date(new Date().toDateString());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
        <p className="text-xl text-gray-600">Find and manage your hotel reservations</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Search className="w-5 h-5" /> Search for Your Booking
        </h2>
        <form onSubmit={handleSearch}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> Email Address
            </label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter the email you booked with"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm">{searchError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {isSearching ? <><Loader className="w-5 h-5 animate-spin" /> Searching…</> : <><Search className="w-5 h-5" /> Search Bookings</>}
          </button>
        </form>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm text-gray-700">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span>Enter the email address you used when making the booking.</span>
        </div>
      </div>

      {/* Cancel modal */}
      <FormModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setSelectedBooking(null); setCancelReason(''); setCancelError(''); }}
        onSubmit={handleConfirmCancel}
        title="Cancel Your Booking"
        submitText={isCancelling ? 'Cancelling…' : 'Confirm Cancellation'}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Note:</strong> Cancellation is allowed more than 24 hours before arrival.
            A full refund will be processed within 5–7 business days.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Please tell us why you're cancelling…"
            />
          </div>
          {cancelError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{cancelError}</p>
            </div>
          )}
          {selectedBooking && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2">
              <p className="font-medium text-gray-900">Booking Summary</p>
              <div className="flex justify-between"><span className="text-gray-600">Reference:</span><span>{selectedBooking.confirmationNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Check-in:</span><span>{formatDate(selectedBooking.arrivalDate)}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total:</span><span className="font-semibold">${selectedBooking.totalAmount.toFixed(2)}</span></div>
            </div>
          )}
        </div>
      </FormModal>

      {/* Results */}
      {hasSearched && (
        <div>
          {results.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} Booking{results.length !== 1 ? 's' : ''}
              </h2>
              {results.map((booking) => {
                const nights = calculateNights(booking.arrivalDate, booking.departureDate);
                return (
                  <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">{booking.confirmationNumber}</h3>
                        <p className="text-blue-100 text-sm">Booked {formatDate(booking.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[booking.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Stay Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Check-in:</span><span className="font-medium">{formatDate(booking.arrivalDate)}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Check-out:</span><span className="font-medium">{formatDate(booking.departureDate)}</span></div>
                            <div className="text-gray-600">{nights} night{nights !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Guests</h4>
                          <p className="text-sm text-gray-700">
                            {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                            {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                          <p className="text-lg font-bold text-gray-900">${booking.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {booking.status === 'CONFIRMED' && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-700">
                            <p className="font-medium text-green-900">Your booking is confirmed!</p>
                            {!canCancel(booking) && (
                              <p className="mt-1 text-orange-700">Arrival is within 24 hours — free cancellation window has passed.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {booking.status === 'CANCELLED' && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 font-medium">This booking has been cancelled. Refund is being processed.</p>
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => navigate(`/hotel/confirmation/${booking.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                        {canCancel(booking) && (
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            <X className="w-4 h-4" /> Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No bookings found</p>
              <p className="text-gray-500 mb-6">No reservations found for <strong>{searchEmail}</strong>. Please check your email and try again.</p>
              <button
                onClick={() => { setHasSearched(false); setSearchEmail(''); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

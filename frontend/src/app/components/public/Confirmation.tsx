import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { CheckCircle, Calendar, Users, Mail, Phone, Printer, Download, Home, AlertCircle, X } from 'lucide-react';
import { dataStore } from '../../data/store';
import { sendBookingEmail, formatDate, calculateNights } from '../../utils/bookingHelpers';

export default function PublicConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(dataStore.getOnlineBookings().find(b => b.id === bookingId));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const roomType = booking ? dataStore.getRoomTypes().find(rt => rt.id === booking.roomTypeId) : null;

  useEffect(() => {
    // Send confirmation email on load
    if (booking && booking.status === 'confirmed') {
      sendBookingEmail(booking, 'confirmation');
    }
  }, []);

  const handleCancelBooking = async () => {
    if (!booking) return;

    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 48) {
      alert('Cancellation must be made at least 48 hours before check-in. Please contact us at +1 (555) 123-4567 for assistance.');
      setShowCancelModal(false);
      return;
    }

    setIsCancelling(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update booking status
    const bookingIndex = dataStore.onlineBookings.findIndex(b => b.id === booking.id);
    if (bookingIndex !== -1) {
      dataStore.onlineBookings[bookingIndex].status = 'cancelled';
      const updatedBooking = dataStore.onlineBookings[bookingIndex];
      setBooking(updatedBooking);
      sendBookingEmail(updatedBooking, 'cancellation');
    }

    setIsCancelling(false);
    setShowCancelModal(false);
  };

  if (!booking || !roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Booking not found</p>
          <Link to="/hotel" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const isCancelled = booking.status === 'cancelled';
  const canCancel = booking.status === 'confirmed' && new Date(booking.checkIn) > new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {!isCancelled ? (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Thank you for choosing Grand Hotel, {booking.guestName}
          </p>
          <p className="text-gray-600">
            A confirmation email has been sent to <span className="font-medium text-gray-900">{booking.guestEmail}</span>
          </p>
          <div className="mt-6 inline-block px-6 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Your Booking Reference</p>
            <p className="text-2xl font-bold text-blue-600">{booking.id}</p>
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
          <p className="text-lg text-gray-700 mb-4">
            Your booking has been cancelled
          </p>
          <p className="text-gray-600">
            Refund will be processed to your original payment method within 5-7 business days
          </p>
        </div>
      )}

      {/* Booking Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Booking Details</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Room Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">{roomType.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{roomType.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {roomType.amenities.map((amenity, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Stay Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                <p className="text-sm text-gray-600 mt-1">After 3:00 PM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                <p className="text-sm text-gray-600 mt-1">Before 11:00 AM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {nights} Night{nights !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guests</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.guests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Guest Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-24">Name:</span>
                <span className="font-medium text-gray-900">{booking.guestName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 w-20">Email:</span>
                <span className="font-medium text-gray-900">{booking.guestEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 w-20">Phone:</span>
                <span className="font-medium text-gray-900">{booking.guestPhone}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">${booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isCancelled
                    ? 'bg-red-100 text-red-700'
                    : booking.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {isCancelled ? 'Cancelled - Refund Pending' : booking.paymentStatus === 'paid' ? 'Fully Paid' : 'Partial Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900 capitalize">{booking.paymentMethod}</span>
              </div>
              {booking.promoCode && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Code Applied:</span>
                  <span className="font-semibold">{booking.promoCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      {!isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Please bring a valid photo ID and the credit card used for booking at check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Early check-in and late check-out are subject to availability</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Free cancellation available up to 48 hours before check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Contact us at +1 (555) 123-4567 for any special requests or modifications</span>
            </li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          <Printer className="w-5 h-5" />
          Print Confirmation
        </button>
        <Link
          to="/hotel/my-bookings"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Download className="w-5 h-5" />
          View My Bookings
        </Link>
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            <X className="w-5 h-5" />
            Cancel Booking
          </button>
        )}
        <Link
          to="/hotel"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Link>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
              A full refund will be processed to your original payment method within 5-7 business days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

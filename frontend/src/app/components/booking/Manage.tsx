import { useState } from 'react';
import { Search, CreditCard, Eye, DollarSign, Edit2, XCircle } from 'lucide-react';
import { dataStore } from '../../data/store';
import { toast } from 'sonner';
import FormModal from '../shared/FormModal';

export default function BookingManage() {
  const [bookings, setBookings] = useState(dataStore.getOnlineBookings());
  const [roomTypes] = useState(dataStore.getRoomTypes());
  const [transactions] = useState(dataStore.getPaymentTransactions());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredBookings = bookings.filter(booking =>
    !searchTerm ||
    booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-orange-100 text-orange-700',
      'partial': 'bg-yellow-100 text-yellow-700',
      'paid': 'bg-green-100 text-green-700',
      'refunded': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setShowDetailsModal(true);
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // TODO: Open edit modal with booking details
    toast.info(`Edit functionality for booking ${bookingId} - Coming soon`);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status === 'cancelled') {
      toast.error('This booking is already cancelled');
      return;
    }

    if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      // Update booking status to cancelled
      const updatedBookings = bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      setBookings(updatedBookings);

      // Update in data store
      const bookingIndex = dataStore.onlineBookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        dataStore.onlineBookings[bookingIndex].status = 'cancelled';
      }

      toast.success(`Booking ${bookingId} has been cancelled`);
    }
  };

  const getBookingTransactions = (bookingId: string) => {
    return transactions.filter(t => t.bookingId === bookingId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Online Bookings</h1>
        <p className="text-gray-600 mt-1">View and manage all online reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, guest name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => {
              const roomType = roomTypes.find(rt => rt.id === booking.roomTypeId);
              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                      <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                      <div className="text-sm text-gray-500">{booking.guestPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{booking.checkIn}</div>
                    <div className="text-gray-500">to {booking.checkOut}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.guests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${booking.totalAmount}
                    {booking.promoCode && (
                      <div className="text-xs text-green-600">Code: {booking.promoCode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                    {booking.paymentMethod && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {booking.paymentMethod}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(booking.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditBooking(booking.id)}
                      className="text-green-600 hover:text-green-800 mr-3 inline-flex items-center gap-1"
                      title="Edit booking"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className={`inline-flex items-center gap-1 ${
                        booking.status === 'cancelled'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      title={booking.status === 'cancelled' ? 'Already cancelled' : 'Cancel booking'}
                      disabled={booking.status === 'cancelled'}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <FormModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          title="Booking Details"
          hideActions
          size="lg"
        >
          {(() => {
            const booking = bookings.find(b => b.id === selectedBooking);
            const roomType = roomTypes.find(rt => rt.id === booking?.roomTypeId);
            const bookingTransactions = getBookingTransactions(selectedBooking);

            if (!booking) return null;

            return (
              <div className="space-y-6">
                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium text-gray-900">{booking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guest Name</p>
                      <p className="font-medium text-gray-900">{booking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{booking.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{booking.guestPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Type</p>
                      <p className="font-medium text-gray-900">{roomType?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium text-gray-900">{booking.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium text-gray-900">{booking.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">{booking.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-900">${booking.totalAmount}</p>
                    </div>
                    {booking.promoCode && (
                      <div>
                        <p className="text-sm text-gray-500">Promo Code</p>
                        <p className="font-medium text-green-600">{booking.promoCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Transactions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  {bookingTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {bookingTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-gray-900">${transaction.amount}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.transactionStatus === 'completed' ? 'bg-green-100 text-green-700' :
                              transaction.transactionStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {transaction.transactionStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Transaction ID:</span>
                              <p className="font-mono text-gray-900">{transaction.gatewayTransactionId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Payment Method:</span>
                              <p className="text-gray-900 capitalize">{transaction.paymentMethod}</p>
                            </div>
                            {transaction.cardLastFour && (
                              <div>
                                <span className="text-gray-500">Card:</span>
                                <p className="text-gray-900">{transaction.cardType} •••• {transaction.cardLastFour}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <p className="text-gray-900">{new Date(transaction.paymentDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                      No payment transactions recorded
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </FormModal>
      )}
    </div>
  );
}

import { useState } from 'react';
import { LogIn, LogOut, DollarSign, XCircle } from 'lucide-react';
import { dataStore } from '../../data/store';
import type { Reservation, FrontOfficeOperation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import FormModal from '../shared/FormModal';

export default function PMSFrontOffice() {
  const [operations, setOperations] = useState(dataStore.getFrontOfficeOps());
  const [reservations, setReservations] = useState(dataStore.getReservations());
  const [guests] = useState(dataStore.getGuests());
  const [users] = useState(dataStore.getUsers());
  const { user } = useAuth();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Check-in form data
  const [checkInData, setCheckInData] = useState({
    reservationId: '',
    guestId: '',
    roomNumber: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    totalAmount: '',
    paidAmount: '',
    specialRequests: ''
  });

  // Check-out form data
  const [checkOutData, setCheckOutData] = useState({
    reservationId: '',
    guestId: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    totalAmount: '',
    paidAmount: '',
    specialRequests: '',
    notes: ''
  });

  // Cancellation form data
  const [cancellationData, setCancellationData] = useState({
    reservationId: '',
    reason: '',
    refundAmount: '',
    notes: ''
  });

  const todayReservations = reservations.filter(r =>
    r.checkIn === '2026-05-28' || r.status === 'checked-in'
  );

  const getOperationIcon = (type: string) => {
    switch(type) {
      case 'check-in': return LogIn;
      case 'check-out': return LogOut;
      case 'deposit': return DollarSign;
      case 'cancellation': return XCircle;
      default: return LogIn;
    }
  };

  const getOperationColor = (type: string) => {
    const colors: Record<string, string> = {
      'check-in': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'check-out': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'deposit': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'room-change': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'cancellation': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };
    return colors[type] || 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200';
  };

  const handleOpenCheckIn = (reservationId?: string) => {
    if (reservationId) {
      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        setCheckInData({
          reservationId: reservation.id,
          guestId: reservation.guestId,
          roomNumber: reservation.roomNumber,
          roomType: reservation.roomType || '',
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          adults: reservation.adults.toString(),
          children: reservation.children.toString(),
          totalAmount: reservation.totalAmount.toString(),
          paidAmount: reservation.paidAmount.toString(),
          specialRequests: reservation.specialRequests || ''
        });
        setIsCreatingNew(false);
      }
    } else {
      setCheckInData({
        reservationId: '',
        guestId: guests[0]?.id || '',
        roomNumber: '',
        roomType: '',
        checkIn: '',
        checkOut: '',
        adults: '2',
        children: '0',
        totalAmount: '',
        paidAmount: '',
        specialRequests: ''
      });
      setIsCreatingNew(false);
    }
    setShowCheckInModal(true);
  };

  const handleOpenCheckOut = (reservationId?: string) => {
    if (reservationId) {
      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        setCheckOutData({
          reservationId: reservation.id,
          guestId: reservation.guestId,
          roomNumber: reservation.roomNumber,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          adults: reservation.adults.toString(),
          children: reservation.children.toString(),
          totalAmount: reservation.totalAmount.toString(),
          paidAmount: reservation.paidAmount.toString(),
          specialRequests: reservation.specialRequests || '',
          notes: ''
        });
      }
    } else {
      setCheckOutData({
        reservationId: '',
        guestId: '',
        roomNumber: '',
        checkIn: '',
        checkOut: '',
        adults: '2',
        children: '0',
        totalAmount: '',
        paidAmount: '',
        specialRequests: '',
        notes: ''
      });
    }
    setShowCheckOutModal(true);
  };

  const handleCheckInSubmit = () => {
    if (!checkInData.guestId || !checkInData.roomNumber || !checkInData.checkIn || !checkInData.checkOut) return;

    let reservationId = checkInData.reservationId;

    // If no reservation selected (new reservation), create one
    if (!reservationId) {
      reservationId = `R${String(reservations.length + 1).padStart(3, '0')}`;
      const newReservation: Reservation = {
        id: reservationId,
        guestId: checkInData.guestId,
        roomNumber: checkInData.roomNumber,
        roomType: checkInData.roomType,
        checkIn: checkInData.checkIn,
        checkOut: checkInData.checkOut,
        adults: parseInt(checkInData.adults),
        children: parseInt(checkInData.children),
        status: 'checked-in',
        totalAmount: parseFloat(checkInData.totalAmount || '0'),
        paidAmount: parseFloat(checkInData.paidAmount || '0'),
        specialRequests: checkInData.specialRequests
      };
      setReservations([...reservations, newReservation]);
      dataStore.reservations.push(newReservation);
    } else {
      // Update existing reservation
      const updatedReservations = reservations.map(r =>
        r.id === reservationId ? {
          ...r,
          status: 'checked-in' as Reservation['status'],
          guestId: checkInData.guestId,
          roomNumber: checkInData.roomNumber,
          adults: parseInt(checkInData.adults),
          children: parseInt(checkInData.children),
          specialRequests: checkInData.specialRequests
        } : r
      );
      setReservations(updatedReservations);

      const resIndex = dataStore.reservations.findIndex(r => r.id === reservationId);
      if (resIndex !== -1) {
        dataStore.reservations[resIndex].status = 'checked-in';
        dataStore.reservations[resIndex].guestId = checkInData.guestId;
        dataStore.reservations[resIndex].roomNumber = checkInData.roomNumber;
        dataStore.reservations[resIndex].adults = parseInt(checkInData.adults);
        dataStore.reservations[resIndex].children = parseInt(checkInData.children);
        dataStore.reservations[resIndex].specialRequests = checkInData.specialRequests;
      }
    }

    const newOperation: FrontOfficeOperation = {
      id: `FO${String(operations.length + 1).padStart(3, '0')}`,
      type: 'check-in',
      reservationId: reservationId,
      performedBy: user?.id || 'U001',
      timestamp: new Date().toISOString(),
      notes: 'Guest checked in successfully'
    };

    setOperations([...operations, newOperation]);
    dataStore.frontOfficeOps.push(newOperation);
    setShowCheckInModal(false);
    setIsCreatingNew(false);
  };

  const handleCheckOutSubmit = () => {
    if (!checkOutData.reservationId) return;

    const updatedReservations = reservations.map(r =>
      r.id === checkOutData.reservationId ? {
        ...r,
        status: 'checked-out' as Reservation['status'],
        guestId: checkOutData.guestId,
        roomNumber: checkOutData.roomNumber,
        adults: parseInt(checkOutData.adults),
        children: parseInt(checkOutData.children),
        specialRequests: checkOutData.specialRequests
      } : r
    );
    setReservations(updatedReservations);

    const resIndex = dataStore.reservations.findIndex(r => r.id === checkOutData.reservationId);
    if (resIndex !== -1) {
      dataStore.reservations[resIndex].status = 'checked-out';
      dataStore.reservations[resIndex].guestId = checkOutData.guestId;
      dataStore.reservations[resIndex].roomNumber = checkOutData.roomNumber;
      dataStore.reservations[resIndex].adults = parseInt(checkOutData.adults);
      dataStore.reservations[resIndex].children = parseInt(checkOutData.children);
      dataStore.reservations[resIndex].specialRequests = checkOutData.specialRequests;
    }

    const newOperation: FrontOfficeOperation = {
      id: `FO${String(operations.length + 1).padStart(3, '0')}`,
      type: 'check-out',
      reservationId: checkOutData.reservationId,
      performedBy: user?.id || 'U001',
      timestamp: new Date().toISOString(),
      notes: checkOutData.notes || 'Guest checked out successfully'
    };

    setOperations([...operations, newOperation]);
    dataStore.frontOfficeOps.push(newOperation);
    setShowCheckOutModal(false);
  };

  const handleDepositSubmit = () => {
    if (!selectedReservation || !depositAmount) return;

    const newOperation: FrontOfficeOperation = {
      id: `FO${String(operations.length + 1).padStart(3, '0')}`,
      type: 'deposit',
      reservationId: selectedReservation,
      performedBy: user?.id || 'U001',
      timestamp: new Date().toISOString(),
      amount: parseFloat(depositAmount),
      notes: 'Deposit collected'
    };

    setOperations([...operations, newOperation]);
    dataStore.frontOfficeOps.push(newOperation);

    // Update reservation paid amount
    const resIndex = reservations.findIndex(r => r.id === selectedReservation);
    if (resIndex !== -1) {
      const updatedReservations = [...reservations];
      updatedReservations[resIndex].paidAmount += parseFloat(depositAmount);
      setReservations(updatedReservations);
      dataStore.reservations[resIndex].paidAmount += parseFloat(depositAmount);
    }

    setShowDepositModal(false);
    setSelectedReservation('');
    setDepositAmount('');
  };

  const handleCancellationSubmit = () => {
    if (!cancellationData.reservationId) return;

    const updatedReservations = reservations.map(r =>
      r.id === cancellationData.reservationId ? {
        ...r,
        status: 'cancelled' as Reservation['status']
      } : r
    );
    setReservations(updatedReservations);

    const resIndex = dataStore.reservations.findIndex(r => r.id === cancellationData.reservationId);
    if (resIndex !== -1) {
      dataStore.reservations[resIndex].status = 'cancelled';
    }

    const newOperation: FrontOfficeOperation = {
      id: `FO${String(operations.length + 1).padStart(3, '0')}`,
      type: 'cancellation',
      reservationId: cancellationData.reservationId,
      performedBy: user?.id || 'U001',
      timestamp: new Date().toISOString(),
      amount: cancellationData.refundAmount ? parseFloat(cancellationData.refundAmount) : undefined,
      notes: `Reason: ${cancellationData.reason}. ${cancellationData.notes || ''}`
    };

    setOperations([...operations, newOperation]);
    dataStore.frontOfficeOps.push(newOperation);
    setShowCancellationModal(false);
    setCancellationData({
      reservationId: '',
      reason: '',
      refundAmount: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Front Office Operations</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Check-in, check-out, deposits, and daily operations</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleOpenCheckIn()}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-green-500 p-3 rounded-full">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Check-In</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Process arrival</span>
        </button>

        <button
          onClick={() => handleOpenCheckOut()}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-blue-500 p-3 rounded-full">
            <LogOut className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Check-Out</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Process departure</span>
        </button>

        <button
          onClick={() => setShowDepositModal(true)}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-purple-500 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Collect Deposit</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Payment collection</span>
        </button>

        <button
          onClick={() => setShowCancellationModal(true)}
          className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="bg-red-500 p-3 rounded-full">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Cancellations</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Cancel reservation</span>
        </button>
      </div>

      {/* Today's Arrivals & Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Arrivals</h2>
          <div className="space-y-3">
            {todayReservations.filter(r => r.checkIn === '2026-05-28').map((res) => {
              const guest = guests.find(g => g.id === res.guestId);
              return (
                <div key={res.id} className={`flex items-center justify-between p-4 rounded-lg ${res.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{guest?.firstName} {guest?.lastName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Room {res.roomNumber} • {res.adults + res.children} guests</p>
                    {res.status === 'cancelled' && (
                      <p className="text-xs text-red-600 mt-1 font-medium">Cancelled</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {res.status === 'checked-in' ? (
                      <span className="px-3 py-1 bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-sm rounded-full">Checked In</span>
                    ) : res.status === 'cancelled' ? (
                      <span className="px-3 py-1 bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-sm rounded-full">Cancelled</span>
                    ) : (
                      <button
                        onClick={() => handleOpenCheckIn(res.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {todayReservations.filter(r => r.checkIn === '2026-05-28').length === 0 && (
              <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No arrivals scheduled for today</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Departures</h2>
          <div className="space-y-3">
            {todayReservations.filter(r => r.checkOut === '2026-05-28').map((res) => {
              const guest = guests.find(g => g.id === res.guestId);
              return (
                <div key={res.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{guest?.firstName} {guest?.lastName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Room {res.roomNumber}</p>
                  </div>
                  {res.status === 'checked-out' ? (
                    <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm rounded-full">Checked Out</span>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckOut(res.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              );
            })}
            {todayReservations.filter(r => r.checkOut === '2026-05-28').length === 0 && (
              <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No departures scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Operations */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Operations</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Reservation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Performed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {operations.slice().reverse().map((op) => {
              const Icon = getOperationIcon(op.type);
              const opUser = users.find(u => u.id === op.performedBy);
              return (
                <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                      <span className={`px-2 py-1 text-xs rounded-full ${getOperationColor(op.type)}`}>
                        {op.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {op.reservationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {opUser?.fullName || op.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(op.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {op.amount ? `$${op.amount}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {op.notes || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Check-In Modal */}
      <FormModal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          setIsCreatingNew(false);
        }}
        onSubmit={handleCheckInSubmit}
        title="Guest Check-In"
        submitText="Complete Check-In"
        size="lg"
      >
        <div className="space-y-4">
          {!isCreatingNew && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
              <select
                value={checkInData.reservationId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setCheckInData({
                      reservationId: '',
                      guestId: guests[0]?.id || '',
                      roomNumber: '',
                      roomType: '',
                      checkIn: '',
                      checkOut: '',
                      adults: '2',
                      children: '0',
                      totalAmount: '',
                      paidAmount: '',
                      specialRequests: ''
                    });
                    setIsCreatingNew(true);
                  } else {
                    const reservation = reservations.find(r => r.id === e.target.value);
                    if (reservation) {
                      setCheckInData({
                        reservationId: reservation.id,
                        guestId: reservation.guestId,
                        roomNumber: reservation.roomNumber,
                        roomType: reservation.roomType || '',
                        checkIn: reservation.checkIn,
                        checkOut: reservation.checkOut,
                        adults: reservation.adults.toString(),
                        children: reservation.children.toString(),
                        totalAmount: reservation.totalAmount.toString(),
                        paidAmount: reservation.paidAmount.toString(),
                        specialRequests: reservation.specialRequests || ''
                      });
                      setIsCreatingNew(false);
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select reservation...</option>
                <option value="NEW" className="font-semibold text-blue-600">+ Create New Reservation</option>
                {reservations.filter(r => r.status === 'confirmed').map(res => {
                  const guest = guests.find(g => g.id === res.guestId);
                  return (
                    <option key={res.id} value={res.id}>
                      {res.id} - {guest?.firstName} {guest?.lastName} - Room {res.roomNumber}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {(checkInData.reservationId || isCreatingNew) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Guest *</label>
                  <select
                    value={checkInData.guestId}
                    onChange={(e) => setCheckInData({ ...checkInData, guestId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Room Number *</label>
                  <input
                    type="text"
                    value={checkInData.roomNumber}
                    onChange={(e) => setCheckInData({ ...checkInData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Room Type *</label>
                <select
                  value={checkInData.roomType}
                  onChange={(e) => setCheckInData({ ...checkInData, roomType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select room type...</option>
                  <option value="Standard Room">Standard Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Executive Suite">Executive Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Actual Arrival Date *</label>
                  <input
                    type="date"
                    value={checkInData.checkIn}
                    onChange={(e) => setCheckInData({ ...checkInData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Actual Departure Date *</label>
                  <input
                    type="date"
                    value={checkInData.checkOut}
                    onChange={(e) => setCheckInData({ ...checkInData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={checkInData.adults}
                    onChange={(e) => setCheckInData({ ...checkInData, adults: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={checkInData.children}
                    onChange={(e) => setCheckInData({ ...checkInData, children: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkInData.totalAmount}
                    onChange={(e) => setCheckInData({ ...checkInData, totalAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Paid Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkInData.paidAmount}
                    onChange={(e) => setCheckInData({ ...checkInData, paidAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Special Requests</label>
                <textarea
                  value={checkInData.specialRequests}
                  onChange={(e) => setCheckInData({ ...checkInData, specialRequests: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or preferences..."
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">Outstanding Balance:</span> $
                  {(parseFloat(checkInData.totalAmount || '0') - parseFloat(checkInData.paidAmount || '0')).toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>
      </FormModal>

      {/* Check-Out Modal */}
      <FormModal
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        onSubmit={handleCheckOutSubmit}
        title="Guest Check-Out"
        submitText="Complete Check-Out"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={checkOutData.reservationId}
              onChange={(e) => {
                const reservation = reservations.find(r => r.id === e.target.value);
                if (reservation) {
                  setCheckOutData({
                    reservationId: reservation.id,
                    guestId: reservation.guestId,
                    roomNumber: reservation.roomNumber,
                    checkIn: reservation.checkIn,
                    checkOut: reservation.checkOut,
                    adults: reservation.adults.toString(),
                    children: reservation.children.toString(),
                    totalAmount: reservation.totalAmount.toString(),
                    paidAmount: reservation.paidAmount.toString(),
                    specialRequests: reservation.specialRequests || '',
                    notes: ''
                  });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation...</option>
              {reservations.filter(r => r.status === 'checked-in').map(res => {
                const guest = guests.find(g => g.id === res.guestId);
                return (
                  <option key={res.id} value={res.id}>
                    {res.id} - {guest?.firstName} {guest?.lastName} - Room {res.roomNumber}
                  </option>
                );
              })}
            </select>
          </div>

          {checkOutData.reservationId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Guest</label>
                  <select
                    value={checkOutData.guestId}
                    onChange={(e) => setCheckOutData({ ...checkOutData, guestId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={checkOutData.roomNumber}
                    onChange={(e) => setCheckOutData({ ...checkOutData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Check-In Date</label>
                  <input
                    type="date"
                    value={checkOutData.checkIn}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700/40"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutData.checkOut}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700/40"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkOutData.totalAmount}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700/40"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Paid Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkOutData.paidAmount}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-700/40"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Check-Out Notes</label>
                <textarea
                  value={checkOutData.notes}
                  onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Room condition, feedback, issues..."
                />
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Outstanding Balance: $
                  {(parseFloat(checkOutData.totalAmount || '0') - parseFloat(checkOutData.paidAmount || '0')).toFixed(2)}
                </p>
                {parseFloat(checkOutData.totalAmount || '0') > parseFloat(checkOutData.paidAmount || '0') && (
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    Please collect remaining payment before check-out
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </FormModal>

      {/* Collect Deposit Modal */}
      <FormModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedReservation('');
          setDepositAmount('');
        }}
        onSubmit={handleDepositSubmit}
        title="Collect Deposit"
        submitText="Collect Deposit"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={selectedReservation}
              onChange={(e) => setSelectedReservation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation...</option>
              {reservations.filter(r => r.status === 'confirmed' || r.status === 'checked-in').map(res => {
                const guest = guests.find(g => g.id === res.guestId);
                return (
                  <option key={res.id} value={res.id}>
                    {res.id} - {guest?.firstName} {guest?.lastName} - Room {res.roomNumber}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Deposit Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="100.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {selectedReservation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Current balance: $
                {reservations.find(r => r.id === selectedReservation)?.totalAmount || 0} total, $
                {reservations.find(r => r.id === selectedReservation)?.paidAmount || 0} paid
              </p>
            </div>
          )}
        </div>
      </FormModal>

      {/* Cancellation Modal */}
      <FormModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setCancellationData({
            reservationId: '',
            reason: '',
            refundAmount: '',
            notes: ''
          });
        }}
        onSubmit={handleCancellationSubmit}
        title="Cancel Reservation"
        submitText="Confirm Cancellation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Reservation *</label>
            <select
              value={cancellationData.reservationId}
              onChange={(e) => setCancellationData({ ...cancellationData, reservationId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation...</option>
              {reservations.filter(r => r.status === 'confirmed' || r.status === 'checked-in').map(res => {
                const guest = guests.find(g => g.id === res.guestId);
                return (
                  <option key={res.id} value={res.id}>
                    {res.id} - {guest?.firstName} {guest?.lastName} - Room {res.roomNumber}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cancellation Reason *</label>
            <select
              value={cancellationData.reason}
              onChange={(e) => setCancellationData({ ...cancellationData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reason...</option>
              <option value="Guest Request">Guest Request</option>
              <option value="No Show">No Show</option>
              <option value="Overbooking">Overbooking</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Refund Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={cancellationData.refundAmount}
              onChange={(e) => setCancellationData({ ...cancellationData, refundAmount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Additional Notes</label>
            <textarea
              value={cancellationData.notes}
              onChange={(e) => setCancellationData({ ...cancellationData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information about the cancellation..."
            />
          </div>

          {cancellationData.reservationId && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">Warning</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                This action will cancel the reservation and cannot be undone.
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}

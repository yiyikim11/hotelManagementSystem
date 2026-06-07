import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CreditCard, Lock, User, Mail, Phone, MapPin, Tag, Check, AlertCircle, Loader } from 'lucide-react';
import { dataStore } from '../../data/store';
import { OnlineBooking } from '../../types';
import { checkRoomAvailability, validateBookingDates, validatePromoCode, calculateNights, sendBookingEmail } from '../../utils/bookingHelpers';

export default function PublicCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roomTypeId = searchParams.get('roomTypeId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const promoId = searchParams.get('promoId') || '';

  const roomType = dataStore.getRoomTypes().find(rt => rt.id === roomTypeId);
  const promotion = promoId ? dataStore.getPromotions().find(p => p.id === promoId) : null;

  const nights = calculateNights(checkIn, checkOut);

  const calculateTotal = () => {
    if (!roomType) return 0;
    let total = roomType.basePrice * nights;
    if (appliedPromotion) {
      if (appliedPromotion.discountType === 'percentage') {
        total = total * (1 - appliedPromotion.discountValue / 100);
      } else {
        total = total - appliedPromotion.discountValue;
      }
    }
    return total;
  };

  const handleApplyPromo = () => {
    setPromoError('');

    if (!promoCodeInput.trim()) {
      setAppliedPromotion(null);
      return;
    }

    const promo = dataStore.getPromotions().find(p => p.code.toUpperCase() === promoCodeInput.toUpperCase());

    if (!promo) {
      setPromoError('Invalid promo code');
      setAppliedPromotion(null);
      return;
    }

    const validation = validatePromoCode(promo.code, checkIn, nights);
    if (!validation.valid) {
      setPromoError(validation.error || 'Promo code is not valid for these dates');
      setAppliedPromotion(null);
      return;
    }

    setAppliedPromotion(promo);
  };

  const handleRemovePromo = () => {
    setPromoCodeInput('');
    setAppliedPromotion(null);
    setPromoError('');
  };

  const [guestData, setGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    specialRequests: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentType: 'full'
  });

  const [promoCodeInput, setPromoCodeInput] = useState(promotion?.code || '');
  const [appliedPromotion, setAppliedPromotion] = useState(promotion);
  const [promoError, setPromoError] = useState('');

  const totalAmount = calculateTotal();
  const depositAmount = totalAmount * 0.3; // 30% deposit
  const paymentAmount = paymentData.paymentType === 'full' ? totalAmount : depositAmount;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate guest information
    if (!guestData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!guestData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!guestData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!guestData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(guestData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    // Validate payment information
    if (!paymentData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }
    if (!paymentData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    if (!paymentData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();
      if (expiry < today) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    if (!paymentData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Validate dates
    const dateValidation = validateBookingDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      newErrors.dates = dateValidation.error || 'Invalid dates';
    }

    // Validate promo code if provided
    if (appliedPromotion) {
      const promoValidation = validatePromoCode(appliedPromotion.code, checkIn, nights);
      if (!promoValidation.valid) {
        newErrors.promo = promoValidation.error || 'Invalid promo code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);

    // Check availability one more time before booking
    const availability = checkRoomAvailability(roomTypeId, checkIn, checkOut);
    if (availability.availableRooms === 0) {
      setErrors({ general: 'Sorry, this room is no longer available for the selected dates.' });
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Randomly simulate payment failure for demo (10% chance)
    const paymentSuccess = Math.random() > 0.1;

    if (!paymentSuccess) {
      setErrors({ payment: 'Payment failed. Please check your card details and try again.' });
      setIsProcessing(false);
      return;
    }

    // Create booking
    const newBooking: OnlineBooking = {
      id: `OB${String(dataStore.getOnlineBookings().length + 1).padStart(3, '0')}`,
      guestName: `${guestData.firstName} ${guestData.lastName}`,
      guestEmail: guestData.email,
      guestPhone: guestData.phone,
      roomTypeId: roomTypeId,
      checkIn,
      checkOut,
      guests: adults + children,
      totalAmount,
      paymentStatus: paymentData.paymentType === 'full' ? 'paid' : 'partial',
      paymentMethod: 'card',
      promoCode: appliedPromotion?.code,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    dataStore.onlineBookings.push(newBooking);

    // Send confirmation email
    sendBookingEmail(newBooking, 'confirmation');

    // Navigate to confirmation
    navigate(`/hotel/confirmation/${newBooking.id}`);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (!roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Room not found or unavailable</p>
          <button
            onClick={() => navigate('/hotel/rooms')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Available Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>

      {appliedPromotion && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-full">
            <Tag className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Promo Code Applied: {appliedPromotion.code}</p>
            <p className="text-xs text-green-700">{appliedPromotion.name} - {appliedPromotion.discountType === 'percentage' ? `${appliedPromotion.discountValue}% off` : `$${appliedPromotion.discountValue} off`}</p>
          </div>
          <button
            type="button"
            onClick={handleRemovePromo}
            className="text-green-700 hover:text-green-900 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* General Error Message */}
      {(errors.general || errors.dates || errors.promo || errors.payment) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 text-sm">
            {errors.general || errors.dates || errors.promo || errors.payment}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.firstName}
                    onChange={(e) => {
                      setGuestData({ ...guestData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.lastName}
                    onChange={(e) => {
                      setGuestData({ ...guestData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => {
                      setGuestData({ ...guestData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => {
                      setGuestData({ ...guestData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+1-555-0000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={guestData.address}
                    onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={guestData.city}
                    onChange={(e) => setGuestData({ ...guestData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={guestData.country}
                    onChange={(e) => setGuestData({ ...guestData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      placeholder="Enter promo code"
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        promoError ? 'border-red-300' : appliedPromotion ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-red-600 text-xs mt-1">{promoError}</p>}
                  {appliedPromotion && !promoError && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <Check className="w-4 h-4" />
                      <span>Promo code applied successfully!</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={guestData.specialRequests}
                    onChange={(e) => setGuestData({ ...guestData, specialRequests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Early check-in, high floor, extra pillows, etc."
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h2>

              {/* Payment Type Selection */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                  paymentData.paymentType === 'full'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentData.paymentType === 'full'}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                    className="mr-2"
                  />
                  <span className="font-medium">Pay Full Amount</span>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    ${totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Complete payment now</div>
                </label>
                <label className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                  paymentData.paymentType === 'deposit'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="deposit"
                    checked={paymentData.paymentType === 'deposit'}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                    className="mr-2"
                  />
                  <span className="font-medium">Pay 30% Deposit</span>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    ${depositAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Pay ${(totalAmount - depositAmount).toFixed(2)} at check-in
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setPaymentData({ ...paymentData, cardNumber: formatted });
                      if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardNumber && <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => {
                      setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() });
                      if (errors.cardName) setErrors({ ...errors, cardName: '' });
                    }}
                    placeholder="JOHN DOE"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardName && <p className="text-red-600 text-xs mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setPaymentData({ ...paymentData, expiryDate: formatted });
                      if (errors.expiryDate) setErrors({ ...errors, expiryDate: '' });
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.expiryDate && <p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPaymentData({ ...paymentData, cvv: value });
                      if (errors.cvv) setErrors({ ...errors, cvv: '' });
                    }}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cvv ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cvv && <p className="text-red-600 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-sm text-gray-700">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your payment information is encrypted with 256-bit SSL and securely processed</span>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{roomType.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium text-gray-900">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium text-gray-900">
                      {adults} adult{adults !== 1 ? 's' : ''}{children > 0 && `, ${children} child${children !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room rate:</span>
                    <span className="text-gray-900">${roomType.basePrice} × {nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">${(roomType.basePrice * nights).toFixed(2)}</span>
                  </div>

                  {appliedPromotion && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {appliedPromotion.name}
                      </span>
                      <span>
                        -{appliedPromotion.discountType === 'percentage'
                          ? `${appliedPromotion.discountValue}%`
                          : `$${appliedPromotion.discountValue}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="font-semibold text-gray-900">Amount Due Now:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${paymentAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Complete Booking
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  By completing this booking, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

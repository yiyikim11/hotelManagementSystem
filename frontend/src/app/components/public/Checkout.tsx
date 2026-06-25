import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CreditCard, Lock, User, Mail, Phone, Tag, Check, AlertCircle, Loader } from 'lucide-react';
import { roomTypesApi, type PublicRoomType } from '../../services/pms/roomTypesApi';
import { publicBookingsApi, type PromoValidateResponse, type PublicPromoCode } from '../../services/booking/publicBookingsApi';

function calculateNights(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6/.test(n)) return 'discover';
  return 'card';
}

function formatCardNumber(value: string) {
  const cleaned = value.replace(/\D/g, '');
  return (cleaned.match(/.{1,4}/g) ?? []).join(' ');
}

function formatExpiry(value: string) {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length >= 2 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) : cleaned;
}

export default function PublicCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomTypeId = searchParams.get('roomTypeId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const promoCodeFromUrl = searchParams.get('promoCode') || '';

  const nights = calculateNights(checkIn, checkOut);

  const [roomType, setRoomType] = useState<PublicRoomType | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [guestData, setGuestData] = useState({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [promoCodeInput, setPromoCodeInput] = useState(promoCodeFromUrl);
  const [availablePromos, setAvailablePromos] = useState<PublicPromoCode[]>([]);
  const [validatedPromo, setValidatedPromo] = useState<PromoValidateResponse | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadRoom = useCallback(async () => {
    if (!roomTypeId) return;
    try {
      const rt = await roomTypesApi.getPublic(roomTypeId);
      setRoomType(rt);
    } catch {
      // room not found — handled below via null check
    } finally {
      setLoadingRoom(false);
    }
  }, [roomTypeId]);

  useEffect(() => { loadRoom(); }, [loadRoom]);

  // Load the list of promo codes a guest can apply
  useEffect(() => {
    publicBookingsApi.listPromoCodes()
      .then(setAvailablePromos)
      .catch(() => setAvailablePromos([]));
  }, []);

  // Whether a promo code's rules fit the current stay (nights + room type).
  // Used only to label the list — the backend remains the source of truth on Apply.
  const promoApplicability = useCallback((promo: PublicPromoCode): string => {
    if (nights < promo.minNights) return `Min ${promo.minNights} nights`;
    if (promo.maxNights != null && nights > promo.maxNights) return `Max ${promo.maxNights} nights`;
    if (roomTypeId && promo.applicableRoomTypeIds.length > 0
        && !promo.applicableRoomTypeIds.includes(roomTypeId)) {
      return 'Not for this room';
    }
    return '';
  }, [nights, roomTypeId]);

  // Auto-validate promo code that arrived from the offers/room-listing page
  useEffect(() => {
    if (promoCodeFromUrl && roomTypeId && checkIn && checkOut) {
      handleValidatePromo(promoCodeFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseTotal = roomType ? roomType.baseRate * nights : 0;
  const discount = validatedPromo
    ? validatedPromo.discountType === 'PERCENTAGE'
      ? baseTotal * validatedPromo.discountValue / 100
      : Math.min(validatedPromo.discountValue, baseTotal)
    : 0;
  const totalAmount = Math.max(0, baseTotal - discount);

  async function handleValidatePromo(code: string) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setValidatedPromo(null);
      setPromoError('');
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const result = await publicBookingsApi.validatePromo({
        code: trimmed,
        arrivalDate: checkIn,
        departureDate: checkOut,
        roomTypeId: roomTypeId || undefined,
      });
      setValidatedPromo(result);
      setPromoCodeInput(trimmed);
    } catch (err) {
      setValidatedPromo(null);
      setPromoError(err instanceof Error ? err.message : 'Invalid promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  }

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!guestData.firstName.trim()) e.firstName = 'Required';
    if (!guestData.lastName.trim()) e.lastName = 'Required';
    if (!guestData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email))
      e.email = 'Valid email required';
    if (!guestData.phone.trim() || !/^[\d\s\-\+\(\)]+$/.test(guestData.phone))
      e.phone = 'Valid phone required';
    const rawCard = cardData.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(rawCard)) e.cardNumber = 'Invalid card number';
    if (!cardData.name.trim()) e.cardName = 'Required';
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      e.expiry = 'Format MM/YY';
    } else {
      const [m, y] = cardData.expiry.split('/');
      if (new Date(2000 + +y, +m - 1) < new Date()) e.expiry = 'Card expired';
    }
    if (!/^\d{3,4}$/.test(cardData.cvv)) e.cvv = 'Invalid CVV';
    if (!checkIn || !checkOut) e.dates = 'Invalid dates';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setIsProcessing(true);
    setErrors({});
    try {
      // 1. Create booking (PENDING_PAYMENT)
      const booking = await publicBookingsApi.create({
        guest: { firstName: guestData.firstName, lastName: guestData.lastName, email: guestData.email, phone: guestData.phone },
        arrivalDate: checkIn,
        departureDate: checkOut,
        adults,
        children,
        roomTypeId,
        promoCode: validatedPromo ? promoCodeInput : undefined,
        specialRequests: guestData.specialRequests || undefined,
      });

      // 2. Pay (mock gateway — card details used for display only)
      const rawCard = cardData.number.replace(/\s/g, '');
      await publicBookingsApi.pay(booking.reservationId, {
        gateway: 'MOCK',
        gatewayTransactionId: crypto.randomUUID(),
        amount: booking.totalAmount,
        currency: booking.currency || 'USD',
        paymentMethod: 'card',
        cardBrand: detectCardBrand(rawCard),
        cardLast4: rawCard.slice(-4),
      });

      navigate(`/hotel/confirmation/${booking.reservationId}`, {
        state: { email: guestData.email, confirmationNumber: booking.confirmationNumber },
      });
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Booking failed. Please try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Room not found or unavailable</p>
          <button onClick={() => navigate('/hotel/rooms')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Available Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['firstName', 'lastName'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field === 'firstName' ? 'First Name' : 'Last Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestData[field]}
                      onChange={(e) => { setGuestData({ ...guestData, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field] ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => { setGuestData({ ...guestData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" /> Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    placeholder="+1-555-0000"
                    onChange={(e) => { setGuestData({ ...guestData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Promo code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => { setPromoCodeInput(e.target.value.toUpperCase()); setPromoError(''); setValidatedPromo(null); }}
                      placeholder="Enter promo code"
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        promoError ? 'border-red-300' : validatedPromo ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleValidatePromo(promoCodeInput)}
                      disabled={isValidatingPromo}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 transition-colors"
                    >
                      {isValidatingPromo ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-red-600 text-xs mt-1">{promoError}</p>}
                  {validatedPromo && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <Check className="w-4 h-4" />
                      <span>
                        {validatedPromo.discountType === 'PERCENTAGE'
                          ? `${validatedPromo.discountValue}% off`
                          : `$${validatedPromo.discountValue} off`} applied!
                      </span>
                    </div>
                  )}

                  {/* Available promo codes the guest can apply */}
                  {availablePromos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Available offers</p>
                      <div className="space-y-2">
                        {availablePromos.map((promo) => {
                          const reason = promoApplicability(promo);
                          const applicable = reason === '';
                          const isApplied = validatedPromo != null && promoCodeInput === promo.code;
                          const discountLabel = promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% off`
                            : `$${promo.discountValue} off`;
                          return (
                            <div
                              key={promo.code}
                              className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                                applicable ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-gray-900">{promo.code}</span>
                                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">{discountLabel}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {promo.packageName}{!applicable && ` · ${reason}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={!applicable || isValidatingPromo || isApplied}
                                onClick={() => handleValidatePromo(promo.code)}
                                className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
                              >
                                {isApplied ? 'Applied' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
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

            {/* Payment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => { setCardData({ ...cardData, number: formatCardNumber(e.target.value) }); setErrors({ ...errors, cardNumber: '' }); }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cardNumber ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.cardNumber && <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => { setCardData({ ...cardData, name: e.target.value.toUpperCase() }); setErrors({ ...errors, cardName: '' }); }}
                    placeholder="JANE SMITH"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cardName ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.cardName && <p className="text-red-600 text-xs mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => { setCardData({ ...cardData, expiry: formatExpiry(e.target.value) }); setErrors({ ...errors, expiry: '' }); }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expiry ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.expiry && <p className="text-red-600 text-xs mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => { setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') }); setErrors({ ...errors, cvv: '' }); }}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cvv ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.cvv && <p className="text-red-600 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-sm text-gray-700">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your payment information is encrypted with 256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Sidebar summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{roomType.name}</h3>
                  {roomType.description && <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>}
                </div>
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Check-in:</span><span className="font-medium">{checkIn}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Check-out:</span><span className="font-medium">{checkOut}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Nights:</span><span className="font-medium">{nights}</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{adults} adult{adults !== 1 ? 's' : ''}{children > 0 && `, ${children} child${children !== 1 ? 'ren' : ''}`}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room rate:</span>
                    <span>${roomType.baseRate} × {nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${baseTotal.toFixed(2)}</span>
                  </div>
                  {validatedPromo && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1"><Tag className="w-4 h-4" />{promoCodeInput}</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="w-5 h-5" /> Complete Booking</>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
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

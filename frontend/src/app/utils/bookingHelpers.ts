import { dataStore } from '../data/store';

export interface RoomAvailability {
  roomTypeId: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
}

export const checkRoomAvailability = (
  roomTypeId: string,
  checkIn: string,
  checkOut: string
): RoomAvailability => {
  const roomType = dataStore.getRoomTypes().find(rt => rt.id === roomTypeId);
  if (!roomType) {
    return { roomTypeId, totalRooms: 0, availableRooms: 0, bookedRooms: 0 };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Get all bookings for this room type that overlap with requested dates
  const overlappingBookings = dataStore.getOnlineBookings().filter(booking => {
    if (booking.roomTypeId !== roomTypeId) return false;
    if (booking.status === 'cancelled') return false;

    const bookingCheckIn = new Date(booking.checkIn);
    const bookingCheckOut = new Date(booking.checkOut);

    // Check for date overlap
    return checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn;
  });

  const bookedRooms = overlappingBookings.length;
  const availableRooms = Math.max(0, roomType.totalRooms - bookedRooms);

  return {
    roomTypeId,
    totalRooms: roomType.totalRooms,
    availableRooms,
    bookedRooms
  };
};

export const validateBookingDates = (checkIn: string, checkOut: string): { valid: boolean; error?: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 30) {
    return { valid: false, error: 'Maximum stay is 30 nights' };
  }

  return { valid: true };
};

export const validatePromoCode = (
  promoCode: string,
  checkIn: string,
  nights: number
): { valid: boolean; promotion?: any; error?: string } => {
  if (!promoCode) {
    return { valid: true }; // No promo code is valid
  }

  const promotions = dataStore.getPromotions();
  const promo = promotions.find(p => p.code.toLowerCase() === promoCode.toLowerCase());

  if (!promo) {
    return { valid: false, error: 'Invalid promo code' };
  }

  if (!promo.isActive) {
    return { valid: false, error: 'This promo code is no longer active' };
  }

  const today = new Date().toISOString().split('T')[0];
  if (today < promo.validFrom || today > promo.validTo) {
    return { valid: false, error: 'This promo code is not valid for the selected dates' };
  }

  if (promo.minNights && nights < promo.minNights) {
    return { valid: false, error: `This promo requires a minimum of ${promo.minNights} nights` };
  }

  return { valid: true, promotion: promo };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const sendBookingEmail = (booking: any, type: 'confirmation' | 'cancellation' | 'modification') => {
  // Simulate sending email
  const emailMessages = {
    confirmation: `
      ✉️ BOOKING CONFIRMATION EMAIL SENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      To: ${booking.guestEmail}
      Subject: Booking Confirmation - ${booking.id}

      Dear ${booking.guestName},

      Thank you for choosing Grand Hotel! Your booking has been confirmed.

      Booking Reference: ${booking.id}
      Check-in: ${booking.checkIn}
      Check-out: ${booking.checkOut}
      Total Amount: $${booking.totalAmount.toFixed(2)}

      We look forward to welcoming you!

      Best regards,
      Grand Hotel Team
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `,
    cancellation: `
      ✉️ CANCELLATION EMAIL SENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      To: ${booking.guestEmail}
      Subject: Booking Cancellation - ${booking.id}

      Dear ${booking.guestName},

      Your booking has been cancelled as requested.

      Booking Reference: ${booking.id}
      Cancellation processed on: ${new Date().toLocaleDateString()}

      Refund will be processed within 5-7 business days.

      We hope to serve you in the future!

      Best regards,
      Grand Hotel Team
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `,
    modification: `
      ✉️ MODIFICATION EMAIL SENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      To: ${booking.guestEmail}
      Subject: Booking Modified - ${booking.id}

      Dear ${booking.guestName},

      Your booking has been successfully modified.

      Booking Reference: ${booking.id}
      Updated Check-in: ${booking.checkIn}
      Updated Check-out: ${booking.checkOut}

      Please review your updated confirmation details.

      Best regards,
      Grand Hotel Team
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `
  };

  console.log(emailMessages[type]);
};

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Users, Wifi, Coffee, Tv, Wind, Check, Tag, AlertCircle, Calendar } from 'lucide-react';
import { dataStore } from '../../data/store';
import { checkRoomAvailability, validateBookingDates, validatePromoCode, calculateNights } from '../../utils/bookingHelpers';
import { toast } from 'sonner';

export default function PublicRoomListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomTypes, setRoomTypes] = useState(dataStore.getRoomTypes());
  const [promotions] = useState(dataStore.getPromotions().filter(p => p.isActive));
  const [selectedPromo, setSelectedPromo] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Refresh room types when component mounts or becomes visible
  useEffect(() => {
    console.log('[RoomListing] Component mounted - loading room types');
    const latestRoomTypes = dataStore.getRoomTypes();
    console.log('[RoomListing] Loaded room types:', latestRoomTypes.length, 'rooms');
    console.log('[RoomListing] Room names:', latestRoomTypes.map(r => r.name));
    setRoomTypes(latestRoomTypes);
  }, []);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const promoCodeFromUrl = searchParams.get('promoCode') || '';

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 1;
  const totalGuests = adults + children;

  // Auto-apply promo code from URL (from special offers page)
  useEffect(() => {
    if (promoCodeFromUrl) {
      const promo = promotions.find(p => p.code.toUpperCase() === promoCodeFromUrl.toUpperCase());
      if (promo) {
        setSelectedPromo(promo.id);
        toast.success(`Promo code "${promo.code}" applied! Discount shown in prices below.`);
      }
    }
  }, [promoCodeFromUrl, promotions]);

  // Validate dates on load
  useEffect(() => {
    if (checkIn && checkOut) {
      const validation = validateBookingDates(checkIn, checkOut);
      if (!validation.valid) {
        setDateError(validation.error || 'Invalid dates');
      } else {
        setDateError('');
      }
    }
  }, [checkIn, checkOut]);

  // Validate promo code when selected
  useEffect(() => {
    if (selectedPromo && checkIn && checkOut) {
      const validation = validatePromoCode(selectedPromo, checkIn, nights);
      if (!validation.valid) {
        setPromoError(validation.error || 'Invalid promo code');
      } else {
        setPromoError('');
      }
    } else {
      setPromoError('');
    }
  }, [selectedPromo, checkIn, checkOut, nights]);

  const calculatePrice = (basePrice: number) => {
    let total = basePrice * nights;
    if (selectedPromo && !promoError) {
      const promo = promotions.find(p => p.id === selectedPromo);
      if (promo) {
        if (promo.discountType === 'percentage') {
          total = total * (1 - promo.discountValue / 100);
        } else {
          total = total - promo.discountValue;
        }
      }
    }
    return total;
  };

  const selectedPromotion = promotions.find(p => p.id === selectedPromo);

  const handleBookRoom = (roomTypeId: string) => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (dateError) {
      alert(dateError);
      return;
    }

    // Check availability
    const availability = checkRoomAvailability(roomTypeId, checkIn, checkOut);
    if (availability.availableRooms === 0) {
      alert('Sorry, no rooms available for these dates. Please select different dates.');
      return;
    }

    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/hotel/checkout?roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&promoId=${selectedPromo}`);
    }, 500);
  };

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'TV': Tv,
    'Coffee Maker': Coffee,
    'Air Conditioning': Wind,
  };

  // Filter rooms by capacity and availability
  const availableRoomTypes = roomTypes
    .filter(rt => rt.capacity >= totalGuests)
    .map(rt => {
      const availability = checkIn && checkOut
        ? checkRoomAvailability(rt.id, checkIn, checkOut)
        : { availableRooms: rt.totalRooms, bookedRooms: 0, totalRooms: rt.totalRooms };
      return { ...rt, availability };
    })
    .filter(rt => rt.availability.availableRooms > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
          <button
            onClick={() => navigate('/hotel')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Modify Search
          </button>
        </div>
        {checkIn && checkOut && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Check-in:</span> {checkIn}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Check-out:</span> {checkOut}
            </div>
            <div>
              <span className="font-medium">Nights:</span> {nights}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">Guests:</span> {adults} adult{adults !== 1 ? 's' : ''}{children > 0 && `, ${children} child${children !== 1 ? 'ren' : ''}`}
            </div>
          </div>
        )}
        {dateError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{dateError}</span>
          </div>
        )}
      </div>

      {/* Applied Promo Code Display */}
      {selectedPromo && selectedPromotion && !promoError && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPromotion.name}</p>
                <p className="text-sm text-gray-600">{selectedPromotion.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Discount</p>
              <p className="text-xl font-bold text-green-600">
                {selectedPromotion.discountType === 'percentage'
                  ? `${selectedPromotion.discountValue}% OFF`
                  : `$${selectedPromotion.discountValue} OFF`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Room Listings */}
      {!dateError && availableRoomTypes.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {availableRoomTypes.length} Room{availableRoomTypes.length !== 1 ? 's' : ''} Available
          </h2>
          {availableRoomTypes.map((room) => {
            const originalPrice = room.basePrice * nights;
            const finalPrice = calculatePrice(room.basePrice);
            const savings = originalPrice - finalPrice;

            return (
              <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  {/* Room Image Placeholder */}
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-blue-200 h-64 md:h-auto flex items-center justify-center relative">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-2">🏨</div>
                      <p className="text-gray-600 font-medium">{room.name}</p>
                    </div>
                    {room.availability.availableRooms <= 3 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Only {room.availability.availableRooms} left!
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                        <p className="text-gray-600 mt-1">{room.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        {savings > 0 ? (
                          <>
                            {/* Crossed out original price */}
                            <div className="text-2xl text-gray-400 line-through mb-1">
                              ${originalPrice.toFixed(2)}
                            </div>
                            {/* Discounted price - LARGE in blue */}
                            <div className="text-4xl font-bold text-blue-600">
                              ${finalPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              for {nights} night{nights !== 1 ? 's' : ''}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl font-bold text-blue-600">
                              ${finalPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              for {nights} night{nights !== 1 ? 's' : ''}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Amenities:</h3>
                      <div className="flex flex-wrap gap-3">
                        {room.amenities.map((amenity, idx) => {
                          const Icon = amenityIcons[amenity] || Check;
                          return (
                            <div key={idx} className="flex items-center gap-1 text-sm text-gray-700">
                              <Icon className="w-4 h-4 text-blue-600" />
                              <span>{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {room.capacity} guests</span>
                      </div>
                      <div>
                        <span className="font-medium">${room.basePrice}</span> per night
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        room.availability.availableRooms > 5
                          ? 'bg-green-100 text-green-700'
                          : room.availability.availableRooms > 0
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {room.availability.availableRooms} room{room.availability.availableRooms !== 1 ? 's' : ''} available
                      </div>
                    </div>

                    {/* Promo Code Info */}
                    {savings > 0 && selectedPromotion && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Tag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Promo code <strong>"{selectedPromotion.code}"</strong> applied! Discount shown in prices below.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleBookRoom(room.id)}
                      disabled={isLoading || room.availability.availableRooms === 0}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Loading...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : dateError ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Invalid Search Dates</p>
          <p className="text-gray-500 mb-4">{dateError}</p>
          <button
            onClick={() => navigate('/hotel')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Modify Search
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No Rooms Available</p>
          <p className="text-gray-500 mb-4">
            {checkIn && checkOut
              ? `No rooms available for ${totalGuests} guest${totalGuests !== 1 ? 's' : ''} on these dates. Please try different dates or reduce the number of guests.`
              : 'Please select your check-in and check-out dates to view available rooms.'}
          </p>
          <button
            onClick={() => navigate('/hotel')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {checkIn && checkOut ? 'Modify Search' : 'Search Rooms'}
          </button>
        </div>
      )}
    </div>
  );
}

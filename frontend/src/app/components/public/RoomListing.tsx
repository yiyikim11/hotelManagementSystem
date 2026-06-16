import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Users, Wifi, Coffee, Tv, Wind, Check, Tag, AlertCircle, Calendar, Loader } from 'lucide-react';
import { roomTypesApi, type PublicRoomType, type AvailabilityItem } from '../../services/pms/roomTypesApi';

function calculateNights(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi, TV: Tv, 'Coffee Maker': Coffee, 'Air Conditioning': Wind,
};

export default function PublicRoomListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const promoCode = searchParams.get('promoCode') || '';

  const nights = useMemo(
    () => (checkIn && checkOut ? calculateNights(checkIn, checkOut) : 1),
    [checkIn, checkOut]
  );
  const totalGuests = adults + children;

  const [roomTypes, setRoomTypes] = useState<PublicRoomType[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [rts, avail] = await Promise.all([
        roomTypesApi.listPublic(),
        checkIn && checkOut ? roomTypesApi.availabilityPublic(checkIn, checkOut) : Promise.resolve([]),
      ]);
      setRoomTypes(rts);
      setAvailability(avail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut]);

  useEffect(() => { load(); }, [load]);

  const dateError = useMemo(() => {
    if (!checkIn || !checkOut) return '';
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (ci < today) return 'Check-in date cannot be in the past';
    if (co <= ci) return 'Check-out must be after check-in';
    return '';
  }, [checkIn, checkOut]);

  const availableRooms = useMemo(() => {
    const availMap = new Map(availability.map(a => [a.roomTypeId, a]));
    return roomTypes
      .filter(rt => rt.maxOccupancy >= totalGuests)
      .map(rt => {
        const avail = availMap.get(rt.id);
        return {
          ...rt,
          availableRooms: avail ? avail.availableRooms : null,
          baseRate: avail?.baseRate ?? rt.baseRate,
        };
      })
      .filter(rt => rt.availableRooms === null || rt.availableRooms > 0);
  }, [roomTypes, availability, totalGuests]);

  const handleBook = (roomTypeId: string) => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates from the home page.');
      return;
    }
    if (dateError) { alert(dateError); return; }
    const params = new URLSearchParams({
      roomTypeId, checkIn, checkOut,
      adults: String(adults), children: String(children),
    });
    if (promoCode) params.set('promoCode', promoCode);
    navigate(`/hotel/checkout?${params}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
          <button onClick={() => navigate('/hotel')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Modify Search
          </button>
        </div>
        {checkIn && checkOut && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span className="font-medium">Check-in:</span> {checkIn}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span className="font-medium">Check-out:</span> {checkOut}</div>
            <div><span className="font-medium">Nights:</span> {nights}</div>
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

      {/* Promo code banner */}
      {promoCode && !dateError && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Tag className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Promo code <strong>{promoCode}</strong> will be applied and validated at checkout.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Listings */}
      {!dateError && availableRooms.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {availableRooms.length} Room{availableRooms.length !== 1 ? 's' : ''} Available
          </h2>
          {availableRooms.map((room) => {
            const effectiveRate = room.promotionalRate ?? room.baseRate;
            const totalPrice = effectiveRate * nights;
            const displayDescription = room.websiteDescription || room.description;
            const avail = room.availableRooms;

            return (
              <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-blue-200 h-64 md:h-auto flex items-center justify-center relative">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-2">🏨</div>
                      <p className="text-gray-600 font-medium">{room.name}</p>
                    </div>
                    {avail !== null && avail <= 3 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Only {avail} left!
                      </div>
                    )}
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                        {displayDescription && <p className="text-gray-600 mt-1">{displayDescription}</p>}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-4xl font-bold text-blue-600">${totalPrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1">for {nights} night{nights !== 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {room.maxOccupancy} guests</span>
                      </div>
                      <div>
                        {room.promotionalRate ? (
                          <>
                            <span className="font-medium text-orange-600">${room.promotionalRate}</span>
                            <span className="ml-2 line-through text-gray-400">${room.baseRate}</span>
                            <span className="ml-1">per night</span>
                          </>
                        ) : (
                          <><span className="font-medium">${room.baseRate}</span> per night</>
                        )}
                      </div>
                      {avail !== null && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          avail > 5 ? 'bg-green-100 text-green-700' : avail > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {avail} room{avail !== 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBook(room.id)}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          {dateError ? (
            <>
              <p className="text-gray-600 text-lg mb-2">Invalid Search Dates</p>
              <p className="text-gray-500 mb-4">{dateError}</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg mb-2">No Rooms Available</p>
              <p className="text-gray-500 mb-4">
                {checkIn && checkOut
                  ? `No rooms available for ${totalGuests} guest${totalGuests !== 1 ? 's' : ''} on these dates.`
                  : 'Please select check-in and check-out dates to view available rooms.'}
              </p>
            </>
          )}
          <button onClick={() => navigate('/hotel')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {checkIn && checkOut ? 'Modify Search' : 'Search Rooms'}
          </button>
        </div>
      )}
    </div>
  );
}

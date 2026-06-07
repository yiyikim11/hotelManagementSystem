import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Tag, Percent, Calendar, Clock, Gift } from 'lucide-react';
import { dataStore } from '../../data/store';

export default function PublicOffers() {
  const navigate = useNavigate();
  const [promotions] = useState(dataStore.getPromotions().filter(p => p.isActive));

  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return {
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0]
    };
  };

  const handleBookWithPromo = (promoCode: string) => {
    const dates = getDefaultDates();
    navigate(`/hotel/rooms?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}&adults=2&children=0&promoCode=${promoCode}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">
          Click "Book Now" to automatically apply the promo code
        </p>
      </div>

      {/* Featured Offers */}
      {promotions.length > 0 ? (
        <div className="space-y-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left: Offer Details */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{promo.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                      {promo.code}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{promo.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{promo.validFrom} - {promo.validTo}</span>
                    </div>
                    {promo.minNights && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Min. {promo.minNights} night{promo.minNights !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Discount & CTA */}
                <div className="flex flex-col items-center md:items-end gap-4 md:min-w-[180px]">
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {promo.discountType === 'percentage' ? (
                        <>{promo.discountValue}%</>
                      ) : (
                        <>${promo.discountValue}</>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      {promo.discountType === 'percentage' ? 'Off' : 'Discount'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookWithPromo(promo.code)}
                    className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No special offers available at this time</p>
        </div>
      )}

      {/* Browse Rooms Link */}
      <div className="mt-12 text-center">
        <button
          onClick={() => navigate('/hotel/rooms')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse all rooms →
        </button>
      </div>
    </div>
  );
}

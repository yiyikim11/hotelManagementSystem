import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Tag, Calendar, Clock, AlertCircle, Loader } from 'lucide-react';
import { offersApi, type Offer } from '../../services/booking/offersApi';

export default function PublicOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const ninetyDaysOut = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await offersApi.list({ from: today, to: ninetyDaysOut });
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [today, ninetyDaysOut]);

  useEffect(() => { load(); }, [load]);

  const handleBookWithPromo = (promoCode: string) => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 2 * 86_400_000).toISOString().split('T')[0];
    navigate(`/hotel/rooms?checkIn=${tomorrow}&checkOut=${dayAfter}&adults=2&children=0&promoCode=${promoCode}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">Click "Book Now" to automatically apply the promo code at checkout</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {offers.length > 0 ? (
        <div className="space-y-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{offer.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                      {offer.code}
                    </span>
                  </div>
                  {offer.description && (
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{offer.validFrom} – {offer.validTo}</span>
                    </div>
                    {offer.minNights > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Min. {offer.minNights} night{offer.minNights !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 md:min-w-[180px]">
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {offer.discountType === 'PERCENTAGE'
                        ? <>{offer.discountValue}%</>
                        : <>${offer.discountValue}</>}
                    </div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      {offer.discountType === 'PERCENTAGE' ? 'Off' : 'Discount'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookWithPromo(offer.code)}
                    className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No special offers available at this time</p>
        </div>
      ) : null}

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

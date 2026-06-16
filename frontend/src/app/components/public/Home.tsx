import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Users, Search, Star, Wifi, Coffee, Car, Dumbbell, Utensils, Sparkles, Tag } from 'lucide-react';
import { offersApi, type Offer } from '../../services/booking/offersApi';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateOffsetStr(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];
}

const FEATURES = [
  { icon: Wifi,     title: 'Free WiFi',       description: 'High-speed internet throughout' },
  { icon: Coffee,   title: 'Breakfast',        description: 'Complimentary buffet breakfast' },
  { icon: Car,      title: 'Free Parking',     description: 'Secure parking for guests' },
  { icon: Dumbbell, title: 'Fitness Center',   description: '24/7 gym access' },
  { icon: Utensils, title: 'Restaurant',       description: 'Fine dining on-site' },
  { icon: Sparkles, title: 'Spa Services',     description: 'Relax and rejuvenate' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson',  rating: 5, date: 'May 2026',   comment: 'Absolutely wonderful stay! The staff was incredibly friendly and the room was spotless. Will definitely return!' },
  { name: 'Michael Chen',   rating: 5, date: 'April 2026', comment: 'Perfect location, amazing amenities, and excellent service. The breakfast buffet was outstanding!' },
  { name: 'Emma Williams',  rating: 5, date: 'March 2026', comment: "Best hotel experience I've had. The attention to detail and customer service exceeded all expectations." },
];

export default function PublicHome() {
  const navigate = useNavigate();

  // Stable date strings — computed once at mount, not on every render
  const defaultCheckIn  = useMemo(() => dateOffsetStr(1), []);
  const defaultCheckOut = useMemo(() => dateOffsetStr(2), []);

  const [searchData, setSearchData] = useState({
    checkIn:  defaultCheckIn,
    checkOut: defaultCheckOut,
    adults:   2,
    children: 0,
  });

  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);

  const loadOffers = useCallback(async () => {
    try {
      const data = await offersApi.list({ from: todayStr(), to: dateOffsetStr(90) });
      setFeaturedOffers(data.slice(0, 3));
    } catch (err) {
      console.warn('Could not load featured offers:', err);
    }
  }, []);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.checkIn || !searchData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    if (new Date(searchData.checkIn) >= new Date(searchData.checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    const params = new URLSearchParams({
      checkIn:  searchData.checkIn,
      checkOut: searchData.checkOut,
      adults:   String(searchData.adults),
      children: String(searchData.children),
    });
    navigate(`/hotel/rooms?${params}`);
  };

  return (
    <div>
      {/* Hero + Search */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Grand Hotel</h1>
            <p className="text-xl md:text-2xl text-blue-100">Experience Luxury. Create Memories.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" /> Check-in
                  </label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    min={todayStr()}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" /> Check-out
                  </label>
                  <input
                    type="date"
                    value={searchData.checkOut}
                    min={searchData.checkIn || todayStr()}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" /> Adults
                  </label>
                  <input
                    type="number" min="1"
                    value={searchData.adults}
                    onChange={(e) => setSearchData({ ...searchData, adults: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" /> Children
                  </label>
                  <input
                    type="number" min="0"
                    value={searchData.children}
                    onChange={(e) => setSearchData({ ...searchData, children: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
              >
                <Search className="w-5 h-5" /> Search Available Rooms
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured offers strip — only shown when offers exist */}
      {featuredOffers.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Current Special Offers</h2>
              <button
                onClick={() => navigate('/hotel/offers')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View all offers →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                        {offer.code}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 ml-3">
                      {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                      <div className="text-xs font-normal text-gray-500">off</div>
                    </div>
                  </div>
                  {offer.description && (
                    <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                  )}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        checkIn:   defaultCheckIn,
                        checkOut:  defaultCheckOut,
                        adults:    '2',
                        children:  '0',
                        promoCode: offer.code,
                      });
                      navigate(`/hotel/rooms?${params}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    <Tag className="w-4 h-4" /> Book with This Offer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Hotel Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Grand Hotel?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[['500+', 'Happy Guests'], ['4.9/5', 'Average Rating'], ['24/7', 'Customer Support']].map(([stat, label]) => (
              <div key={label} className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat}</div>
                <div className="text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Guests Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{t.comment}"</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="text-gray-500">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of satisfied guests and experience luxury hospitality
          </p>
          <button
            onClick={() => navigate('/hotel/rooms')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 text-lg font-medium"
          >
            View Available Rooms
          </button>
        </div>
      </div>
    </div>
  );
}

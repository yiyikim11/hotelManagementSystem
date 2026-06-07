import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Users, Search, Star, Wifi, Coffee, Car, Dumbbell, Utensils, Sparkles } from 'lucide-react';

export default function PublicHome() {
  const navigate = useNavigate();

  // Set default dates (today + 1 for check-in, today + 2 for check-out)
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

  const [searchData, setSearchData] = useState({
    checkIn: getDefaultDates().checkIn,
    checkOut: getDefaultDates().checkOut,
    adults: 2,
    children: 0
  });

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

    navigate(`/hotel/rooms?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&adults=${searchData.adults}&children=${searchData.children}`);
  };

  const features = [
    { icon: Wifi, title: "Free WiFi", description: "High-speed internet throughout" },
    { icon: Coffee, title: "Breakfast", description: "Complimentary buffet breakfast" },
    { icon: Car, title: "Free Parking", description: "Secure parking for guests" },
    { icon: Dumbbell, title: "Fitness Center", description: "24/7 gym access" },
    { icon: Utensils, title: "Restaurant", description: "Fine dining on-site" },
    { icon: Sparkles, title: "Spa Services", description: "Relax and rejuvenate" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely wonderful stay! The staff was incredibly friendly and the room was spotless. Will definitely return!",
      date: "May 2026"
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment: "Perfect location, amazing amenities, and excellent service. The breakfast buffet was outstanding!",
      date: "April 2026"
    },
    {
      name: "Emma Williams",
      rating: 5,
      comment: "Best hotel experience I've had. The attention to detail and customer service exceeded all expectations.",
      date: "March 2026"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Grand Hotel</h1>
            <p className="text-xl md:text-2xl text-blue-100">Experience Luxury. Create Memories.</p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={searchData.adults}
                    onChange={(e) => setSearchData({ ...searchData, adults: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={searchData.children}
                    onChange={(e) => setSearchData({ ...searchData, children: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
              >
                <Search className="w-5 h-5" />
                Search Available Rooms
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Hotel Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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

      {/* Why Choose Us */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Grand Hotel?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Guests</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Guests Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{testimonial.name}</span>
                <span className="text-gray-500">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
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

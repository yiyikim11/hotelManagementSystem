import { Outlet, Link, useLocation } from "react-router";
import { Hotel, Calendar, Tag, Mail, Phone, MapPin } from "lucide-react";
import { Toaster } from "../ui/sonner";

export default function PublicLayout() {
  const location = useLocation();

  const navigation = [
    { name: "Home", path: "/hotel" },
    { name: "Rooms", path: "/hotel/rooms" },
    { name: "Special Offers", path: "/hotel/offers" },
    { name: "My Bookings", path: "/hotel/my-bookings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/hotel" className="flex items-center gap-2">
              <Hotel className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-xl text-gray-900">Grand Hotel</h1>
                <p className="text-xs text-gray-500">Luxury & Comfort</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-lg">Grand Hotel</span>
              </div>
              <p className="text-gray-400 text-sm">
                Experience luxury and comfort in the heart of the city. Your home away from home.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/hotel" className="hover:text-white">Home</Link></li>
                <li><Link to="/hotel/rooms" className="hover:text-white">Rooms</Link></li>
                <li><Link to="/hotel/offers" className="hover:text-white">Special Offers</Link></li>
                <li><Link to="/hotel/my-bookings" className="hover:text-white">My Bookings</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@grandhotel.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>123 Luxury Ave, Downtown, NY 10001</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Business Hours</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Check-in: 3:00 PM</li>
                <li>Check-out: 11:00 AM</li>
                <li>Front Desk: 24/7</li>
                <li>Concierge: 7 AM - 10 PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Grand Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

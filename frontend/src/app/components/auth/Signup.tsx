import { Link } from 'react-router';
import { Hotel, Info } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Hotel className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Hotel Manager</h1>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Registration</h2>
        <p className="text-gray-600 mb-6">
          Staff accounts are created by your system administrator. Please contact your hotel admin to get access.
        </p>
        <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

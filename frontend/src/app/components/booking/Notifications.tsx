import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { EmailService } from '../../services/emailService';
import { EmailNotification } from '../../types';

export default function BookingNotifications() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setNotifications(EmailService.getEmailLog());
  };

  const getTemplateLabel = (template: string) => {
    const labels: Record<string, string> = {
      'booking_confirmation': 'Booking Confirmation',
      'payment_update': 'Payment Update',
      'cancellation_notice': 'Cancellation Notice',
      'payment_receipt': 'Payment Receipt'
    };
    return labels[template] || template;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'sent': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'failed': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    };
    return colors[status] || 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Notifications</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track all automated email notifications sent to guests</p>
        </div>
        <button
          onClick={loadNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Sent</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {notifications.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Successfully Sent</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {notifications.filter(n => n.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {notifications.filter(n => n.status === 'failed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {notifications.filter(n => n.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Notifications Yet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Email notifications will appear here when bookings are created or updated.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Sent At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {[...notifications].reverse().map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getTemplateLabel(notification.template)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {notification.to}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {notification.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {notification.status === 'failed' && notification.errorMessage && (
                      <span className="text-red-600 dark:text-red-400 text-xs">
                        {notification.errorMessage}
                      </span>
                    )}
                    {notification.status === 'sent' && notification.data?.bookingId && (
                      <span className="text-gray-600 dark:text-gray-300 text-xs">
                        Booking: {notification.data.bookingId}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Templates Info */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automated Email Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Booking Confirmation</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Sent when a new booking is successfully created and paid.
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">Payment Receipt</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Sent when a payment transaction is successfully processed.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Payment Update</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Sent when payment status changes (pending, partial, completed).
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">Cancellation Notice</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Sent when a booking is cancelled with refund details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

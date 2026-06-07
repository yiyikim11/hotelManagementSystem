import { useState } from 'react';
import { Plus, DollarSign, Eye, CheckCircle } from 'lucide-react';
import { dataStore } from '../../data/store';
import { Charge } from '../../types';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

export default function PMSCharges() {
  const [charges, setCharges] = useState(dataStore.getCharges());
  const [reservations] = useState(dataStore.getReservations());
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewChargeId, setViewChargeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reservationId: '',
    type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const getChargeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'room': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'tax': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'minibar': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'laundry': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'food': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'other': 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200'
    };
    return colors[type] || 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200';
  };

  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);
  const paidCharges = charges.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);
  const unpaidCharges = totalCharges - paidCharges;

  // Get all charges for a specific reservation (for invoice view)
  const getChargesForReservation = (reservationId: string) => {
    return charges.filter(c => c.reservationId === reservationId);
  };

  const viewedCharge = viewChargeId ? charges.find(c => c.id === viewChargeId) : null;
  const invoiceCharges = viewedCharge ? getChargesForReservation(viewedCharge.reservationId) : [];
  const invoiceTotal = invoiceCharges.reduce((sum, c) => sum + c.amount, 0);

  const handleSubmit = () => {
    const newCharge: Charge = {
      id: `CHG${String(charges.length + 1).padStart(3, '0')}`,
      reservationId: formData.reservationId,
      type: formData.type as Charge['type'],
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      isPaid: false
    };

    setCharges([...charges, newCharge]);
    dataStore.charges.push(newCharge);
    setShowAddModal(false);
    setFormData({
      reservationId: '',
      type: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const markAsPaid = (chargeId: string) => {
    const updatedCharges = charges.map(c =>
      c.id === chargeId ? { ...c, isPaid: true } : c
    );
    setCharges(updatedCharges);
    const chargeIndex = dataStore.charges.findIndex(c => c.id === chargeId);
    if (chargeIndex !== -1) {
      dataStore.charges[chargeIndex].isPaid = true;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charges & Invoicing</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track room charges and extra expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Charge
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Charges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalCharges}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${paidCharges}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Unpaid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${unpaidCharges}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Charge ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Reservation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {charges.map((charge) => {
              const reservation = reservations.find(r => r.id === charge.reservationId);
              return (
                <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {charge.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {charge.reservationId}
                    <div className="text-xs text-gray-500 dark:text-zinc-400">Room {reservation?.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${charge.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {charge.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      charge.isPaid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {charge.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setViewChargeId(charge.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-200 mr-3 inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {!charge.isPaid && (
                      <button
                        onClick={() => markAsPaid(charge.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-200 inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Charge Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add New Charge"
        submitText="Add Charge"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Reservation *</label>
            <select
              value={formData.reservationId}
              onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reservation...</option>
              {reservations.filter(r => r.status === 'checked-in' || r.status === 'confirmed').map(res => (
                <option key={res.id} value={res.id}>
                  {res.id} - Room {res.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Charge Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type...</option>
              <option value="room">Room</option>
              <option value="tax">Tax</option>
              <option value="minibar">Minibar</option>
              <option value="laundry">Laundry</option>
              <option value="food">Food Service</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the charge..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="50.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </FormModal>

      {/* View Invoice Modal */}
      {viewedCharge && (
        <Modal
          isOpen={!!viewedCharge}
          onClose={() => setViewChargeId(null)}
          title="Invoice"
          size="md"
        >
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b border-gray-200 dark:border-zinc-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Hotel Manager</p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Invoice ID:</p>
                <p className="font-medium text-gray-900 dark:text-white">{viewedCharge.id}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Date:</p>
                <p className="font-medium text-gray-900 dark:text-white">{viewedCharge.date}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Reservation:</p>
                <p className="font-medium text-gray-900 dark:text-white">{viewedCharge.reservationId}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Room Number:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {reservations.find(r => r.id === viewedCharge.reservationId)?.roomNumber}
                </p>
              </div>
            </div>

            {/* Charges List */}
            <div className="border-t border-b border-gray-200 dark:border-zinc-700 py-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Charges</h3>
              <div className="space-y-3">
                {invoiceCharges.map((charge) => (
                  <div key={charge.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getChargeTypeColor(charge.type)}`}>
                          {charge.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{charge.description}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Date: {charge.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">${charge.amount.toFixed(2)}</p>
                      <span className={`text-xs ${charge.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                        {charge.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 dark:bg-zinc-700/40 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${invoiceTotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Paid: ${invoiceCharges.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Balance Due: ${invoiceCharges.filter(c => !c.isPaid).reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 dark:text-zinc-400 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <p>Thank you for choosing Hotel Manager</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

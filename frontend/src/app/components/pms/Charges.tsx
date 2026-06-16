import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, Eye, XCircle, Lock } from 'lucide-react';
import {
  folioApi,
  type Folio,
  type ChargeType,
  type PostChargeRequest,
} from '../../services/pms/folioApi';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

const CHARGE_TYPES: ChargeType[] = [
  'ROOM', 'TAX', 'FOOD', 'MINIBAR', 'LAUNDRY', 'SPA', 'PARKING', 'OTHER', 'CANCELLATION_FEE',
];

const chargeTypeColor: Record<ChargeType, string> = {
  ROOM: 'bg-blue-100 text-blue-700',
  TAX: 'bg-purple-100 text-purple-700',
  FOOD: 'bg-orange-100 text-orange-700',
  MINIBAR: 'bg-green-100 text-green-700',
  LAUNDRY: 'bg-yellow-100 text-yellow-700',
  SPA: 'bg-pink-100 text-pink-700',
  PARKING: 'bg-indigo-100 text-indigo-700',
  OTHER: 'bg-gray-100 text-gray-700',
  CANCELLATION_FEE: 'bg-red-100 text-red-700',
};

const emptyChargeForm: PostChargeRequest = {
  chargeType: 'OTHER',
  description: '',
  quantity: 1,
  unitPrice: 0,
};

export default function PMSCharges() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [viewFolio, setViewFolio] = useState<Folio | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFolioId, setSelectedFolioId] = useState('');
  const [chargeForm, setChargeForm] = useState<PostChargeRequest>(emptyChargeForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await folioApi.list();
      setFolios(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load folios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAmount = folios.reduce((s, f) => s + Number(f.totalAmount), 0);
  const paidAmount = folios.filter(f => f.status === 'CLOSED').reduce((s, f) => s + Number(f.totalAmount), 0);
  const unpaidAmount = folios.filter(f => f.status === 'OPEN').reduce((s, f) => s + Number(f.totalAmount), 0);

  const handleAddCharge = async () => {
    if (!selectedFolioId) return;
    try {
      await folioApi.postCharge(selectedFolioId, chargeForm);
      setShowAddModal(false);
      setChargeForm(emptyChargeForm);
      setSelectedFolioId('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post charge');
    }
  };

  const handleCloseFolio = async (id: string) => {
    if (!confirm('Close this folio? This marks it as settled and no further charges can be posted.')) return;
    try {
      await folioApi.close(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to close folio');
    }
  };

  const handleVoidItem = async (folioId: string, itemId: string) => {
    if (!confirm('Void this charge item?')) return;
    try {
      const updated = await folioApi.voidItem(folioId, itemId);
      setViewFolio(updated);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to void item');
    }
  };

  const openFolios = folios.filter(f => f.status === 'OPEN');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charges & Invoicing</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track folio charges and guest invoices</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setSelectedFolioId(''); setChargeForm(emptyChargeForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Post Charge
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Billed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Settled (Closed Folios)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${paidAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Outstanding (Open Folios)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${unpaidAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Folios Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Confirmation #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {folios.map((folio) => (
                <tr key={folio.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {folio.confirmationNumber ?? folio.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {folio.guestName ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {folio.items.filter(i => !i.voidedAt).length} active
                    {folio.items.some(i => i.voidedAt) && (
                      <span className="ml-1 text-xs text-gray-400">({folio.items.filter(i => i.voidedAt).length} voided)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${Number(folio.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${folio.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {folio.status === 'CLOSED' ? 'Settled' : 'Open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setViewFolio(folio)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mr-3 inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {folio.status === 'OPEN' && (
                      <button
                        onClick={() => handleCloseFolio(folio.id)}
                        className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                      >
                        <Lock className="w-4 h-4" />
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {folios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No folios found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Post Charge Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCharge}
        title="Post Charge to Folio"
        submitText="Post Charge"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Folio (Open) *</label>
            <select
              value={selectedFolioId}
              onChange={(e) => setSelectedFolioId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select folio…</option>
              {openFolios.map(f => (
                <option key={f.id} value={f.id}>
                  {f.confirmationNumber ?? f.id.slice(0, 8)} — {f.guestName ?? 'Unknown guest'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Charge Type *</label>
            <select
              value={chargeForm.chargeType}
              onChange={(e) => setChargeForm({ ...chargeForm, chargeType: e.target.value as ChargeType })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {CHARGE_TYPES.map(ct => (
                <option key={ct} value={ct}>{ct.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description</label>
            <textarea
              value={chargeForm.description ?? ''}
              onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
              rows={2}
              placeholder="Describe the charge…"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity *</label>
              <input
                type="number"
                min="1"
                value={chargeForm.quantity}
                onChange={(e) => setChargeForm({ ...chargeForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={chargeForm.unitPrice}
                onChange={(e) => setChargeForm({ ...chargeForm, unitPrice: parseFloat(e.target.value) || 0 })}
                placeholder="50.00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
            Total: <strong>${(chargeForm.quantity * chargeForm.unitPrice).toFixed(2)}</strong>
          </div>
        </div>
      </FormModal>

      {/* Invoice / Folio Detail Modal */}
      {viewFolio && (
        <Modal
          isOpen
          onClose={() => setViewFolio(null)}
          title={`Folio — ${viewFolio.confirmationNumber ?? viewFolio.id.slice(0, 8)}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Guest</p>
                <p className="font-medium text-gray-900 dark:text-white">{viewFolio.guestName ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${viewFolio.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {viewFolio.status === 'CLOSED' ? 'Settled' : 'Open'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Charge Items</h3>
              {viewFolio.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No charges posted yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewFolio.items.map((item) => (
                    <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg ${item.voidedAt ? 'bg-gray-50 dark:bg-zinc-700/20 opacity-60' : 'bg-gray-50 dark:bg-zinc-700/40'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${chargeTypeColor[item.chargeType]}`}>
                            {item.chargeType.replace('_', ' ')}
                          </span>
                          {item.voidedAt && (
                            <span className="text-xs text-red-500 flex items-center gap-0.5">
                              <XCircle className="w-3 h-3" />voided
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-medium text-sm ${item.voidedAt ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          ${Number(item.amount).toFixed(2)}
                        </p>
                        {!item.voidedAt && viewFolio.status === 'OPEN' && (
                          <button
                            onClick={() => handleVoidItem(viewFolio.id, item.id)}
                            className="text-xs text-red-500 hover:text-red-700 mt-1"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-zinc-700/40 rounded-lg p-4 border-t border-gray-200 dark:border-zinc-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${Number(viewFolio.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

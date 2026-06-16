import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import {
  cancellationPoliciesApi,
  type CancellationPolicy,
  type CancellationPolicyRequest,
  type FeeType,
} from '../../services/pms/cancellationPoliciesApi';
import FormModal from '../shared/FormModal';

const FEE_TYPE_LABELS: Record<FeeType, string> = {
  PERCENTAGE: 'Percentage of total',
  FIXED_AMOUNT: 'Fixed amount ($)',
  FIRST_NIGHT: 'First night charge',
};

const penaltyLabel = (policy: CancellationPolicy) => {
  if (policy.feeType === 'PERCENTAGE') {
    if (policy.feeValue === 0) return 'No charge';
    return `${policy.feeValue}% of total`;
  }
  if (policy.feeType === 'FIXED_AMOUNT') return `$${Number(policy.feeValue).toFixed(2)} flat fee`;
  if (policy.feeType === 'FIRST_NIGHT') return 'First night charge';
  return '—';
};

const severityColor = (policy: CancellationPolicy) => {
  if (policy.feeValue === 0) return 'bg-green-100 text-green-700';
  if (policy.feeType === 'PERCENTAGE' && policy.feeValue === 100) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const severityLabel = (policy: CancellationPolicy) => {
  if (policy.feeValue === 0) return 'Flexible';
  if (policy.feeType === 'PERCENTAGE' && policy.feeValue === 100) return 'Non-Refundable';
  return 'Moderate';
};

const emptyForm = {
  code: '',
  name: '',
  description: '',
  hoursBeforeArrival: '',
  feeType: 'PERCENTAGE' as FeeType,
  feeValue: '',
  isActive: true,
};

export default function CancellationPolicies() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await cancellationPoliciesApi.list();
      setPolicies(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    setEditingPolicy(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (policy: CancellationPolicy) => {
    setEditingPolicy(policy);
    setForm({
      code: policy.code,
      name: policy.name,
      description: policy.description ?? '',
      hoursBeforeArrival: String(policy.hoursBeforeArrival),
      feeType: policy.feeType,
      feeValue: String(policy.feeValue),
      isActive: policy.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cancellation policy?')) return;
    try {
      await cancellationPoliciesApi.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete policy');
    }
  };

  const handleSubmit = async () => {
    const req: CancellationPolicyRequest = {
      code: form.code,
      name: form.name,
      description: form.description || undefined,
      hoursBeforeArrival: parseInt(form.hoursBeforeArrival),
      feeType: form.feeType,
      feeValue: parseFloat(form.feeValue),
      isActive: form.isActive,
    };
    try {
      if (editingPolicy) {
        await cancellationPoliciesApi.update(editingPolicy.id, req);
      } else {
        await cancellationPoliciesApi.create(req);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save policy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cancellation Policies</h1>
          <p className="text-gray-600 mt-1">Define cancellation terms and penalty structures</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Policy
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Policies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{policies.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Free Cancellation</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{policies.filter(p => p.feeValue === 0).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Non-Refundable</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {policies.filter(p => p.feeType === 'PERCENTAGE' && p.feeValue === 100).length}
          </p>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancel Window</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{policy.name}</span>
                        <span className="ml-2 text-xs text-gray-400 font-mono">{policy.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {policy.hoursBeforeArrival >= 999
                      ? 'Any time (no free cancel)'
                      : `Free if cancelled ≥ ${policy.hoursBeforeArrival}h before arrival`}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{penaltyLabel(policy)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${severityColor(policy)}`}>
                      {severityLabel(policy)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(policy)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && policies.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No cancellation policies defined</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingPolicy ? 'Edit Policy' : 'New Cancellation Policy'}
        submitText={editingPolicy ? 'Update' : 'Create'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="FLEX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Flexible"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hours Before Arrival for Free Cancel *</label>
            <input
              type="number"
              value={form.hoursBeforeArrival}
              onChange={(e) => setForm({ ...form, hoursBeforeArrival: e.target.value })}
              placeholder="24"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Use 999 for non-refundable (no free cancel window)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Type *</label>
            <select
              value={form.feeType}
              onChange={(e) => setForm({ ...form, feeType: e.target.value as FeeType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(FEE_TYPE_LABELS) as FeeType[]).map(ft => (
                <option key={ft} value={ft}>{FEE_TYPE_LABELS[ft]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penalty Value *{form.feeType === 'PERCENTAGE' ? ' (%)' : form.feeType === 'FIXED_AMOUNT' ? ' ($)' : ''}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.feeValue}
              onChange={(e) => setForm({ ...form, feeValue: e.target.value })}
              placeholder={form.feeType === 'PERCENTAGE' ? '100' : form.feeType === 'FIXED_AMOUNT' ? '150.00' : '1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </FormModal>
    </div>
  );
}

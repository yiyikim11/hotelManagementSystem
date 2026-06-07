import { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface CancellationPolicy {
  id: string;
  name: string;
  hoursBeforeArrival: number;
  penaltyType: 'percentage' | 'fixed' | 'nights';
  penaltyValue: number;
  createdAt: string;
}

const initialPolicies: CancellationPolicy[] = [
  {
    id: 'CP001',
    name: 'Flexible',
    hoursBeforeArrival: 24,
    penaltyType: 'percentage',
    penaltyValue: 0,
    createdAt: '2024-01-01',
  },
  {
    id: 'CP002',
    name: 'Moderate',
    hoursBeforeArrival: 48,
    penaltyType: 'percentage',
    penaltyValue: 50,
    createdAt: '2024-01-01',
  },
  {
    id: 'CP003',
    name: 'Strict',
    hoursBeforeArrival: 72,
    penaltyType: 'percentage',
    penaltyValue: 100,
    createdAt: '2024-01-01',
  },
  {
    id: 'CP004',
    name: 'Non-Refundable',
    hoursBeforeArrival: 999,
    penaltyType: 'percentage',
    penaltyValue: 100,
    createdAt: '2024-02-15',
  },
  {
    id: 'CP005',
    name: 'First Night Penalty',
    hoursBeforeArrival: 48,
    penaltyType: 'nights',
    penaltyValue: 1,
    createdAt: '2024-03-01',
  },
];

const penaltyLabel = (policy: CancellationPolicy) => {
  if (policy.penaltyType === 'percentage') {
    if (policy.penaltyValue === 0) return 'No charge';
    return `${policy.penaltyValue}% of total`;
  }
  if (policy.penaltyType === 'fixed') return `$${policy.penaltyValue.toFixed(2)} flat fee`;
  if (policy.penaltyType === 'nights') return `${policy.penaltyValue} night(s) charge`;
  return '—';
};

const severityColor = (policy: CancellationPolicy) => {
  if (policy.penaltyValue === 0) return 'bg-green-100 text-green-700';
  if (policy.penaltyType === 'percentage' && policy.penaltyValue === 100) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

export default function CancellationPolicies() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>(initialPolicies);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);
  const [form, setForm] = useState({
    name: '',
    hoursBeforeArrival: '',
    penaltyType: 'percentage' as CancellationPolicy['penaltyType'],
    penaltyValue: '',
  });

  const handleAdd = () => {
    setEditingPolicy(null);
    setForm({ name: '', hoursBeforeArrival: '', penaltyType: 'percentage', penaltyValue: '' });
    setShowModal(true);
  };

  const handleEdit = (policy: CancellationPolicy) => {
    setEditingPolicy(policy);
    setForm({
      name: policy.name,
      hoursBeforeArrival: policy.hoursBeforeArrival.toString(),
      penaltyType: policy.penaltyType,
      penaltyValue: policy.penaltyValue.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? {
        ...p,
        name: form.name,
        hoursBeforeArrival: parseInt(form.hoursBeforeArrival),
        penaltyType: form.penaltyType,
        penaltyValue: parseFloat(form.penaltyValue),
      } : p));
    } else {
      setPolicies([...policies, {
        id: `CP${String(policies.length + 1).padStart(3, '0')}`,
        name: form.name,
        hoursBeforeArrival: parseInt(form.hoursBeforeArrival),
        penaltyType: form.penaltyType,
        penaltyValue: parseFloat(form.penaltyValue),
        createdAt: new Date().toISOString().split('T')[0],
      }]);
    }
    setShowModal(false);
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Policies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{policies.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Free Cancellation</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{policies.filter(p => p.penaltyValue === 0).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Non-Refundable</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {policies.filter(p => p.penaltyType === 'percentage' && p.penaltyValue === 100).length}
          </p>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancel Window</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{policy.name}</span>
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
                    {policy.penaltyValue === 0 ? 'Flexible' : policy.penaltyType === 'percentage' && policy.penaltyValue === 100 ? 'Non-Refundable' : 'Moderate'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{policy.createdAt}</td>
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
        {policies.length === 0 && (
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
              value={form.penaltyType}
              onChange={(e) => setForm({ ...form, penaltyType: e.target.value as CancellationPolicy['penaltyType'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage of total</option>
              <option value="fixed">Fixed amount ($)</option>
              <option value="nights">Number of nights</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penalty Value * {form.penaltyType === 'percentage' ? '(%)' : form.penaltyType === 'fixed' ? '($)' : '(nights)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.penaltyValue}
              onChange={(e) => setForm({ ...form, penaltyValue: e.target.value })}
              placeholder={form.penaltyType === 'percentage' ? '100' : form.penaltyType === 'fixed' ? '150.00' : '1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

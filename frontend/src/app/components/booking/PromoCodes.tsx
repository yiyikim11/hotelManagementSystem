import { useState } from 'react';
import { Plus, Edit2, Tag, Hash, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface PromoCode {
  id: string;
  code: string;
  packageName: string;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
}

const initialPromoCodes: PromoCode[] = [
  {
    id: 'PC001', code: 'SUMMER25', packageName: 'Summer Special', usageLimit: 100, usageCount: 43,
    validFrom: '2026-06-01', validTo: '2026-08-31', isActive: true, createdAt: '2026-05-01',
  },
  {
    id: 'PC002', code: 'WELCOME10', packageName: 'Welcome Offer', usageLimit: null, usageCount: 218,
    validFrom: '2026-01-01', validTo: '2026-12-31', isActive: true, createdAt: '2026-01-01',
  },
  {
    id: 'PC003', code: 'CORP2026', packageName: 'Corporate Rate', usageLimit: 50, usageCount: 50,
    validFrom: '2026-01-01', validTo: '2026-06-30', isActive: false, createdAt: '2026-01-10',
  },
  {
    id: 'PC004', code: 'HONEYMOON', packageName: 'Honeymoon Package', usageLimit: 20, usageCount: 7,
    validFrom: '2026-04-01', validTo: '2026-12-31', isActive: true, createdAt: '2026-03-15',
  },
  {
    id: 'PC005', code: 'FLASH50', packageName: 'Flash Sale', usageLimit: 30, usageCount: 30,
    validFrom: '2026-05-10', validTo: '2026-05-12', isActive: false, createdAt: '2026-05-09',
  },
];

const MOCK_PACKAGES = ['Summer Special', 'Welcome Offer', 'Corporate Rate', 'Honeymoon Package', 'Flash Sale', 'Early Bird', 'Weekend Getaway'];

export default function PromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'exhausted'>('all');
  const [form, setForm] = useState({
    code: '', packageName: '', usageLimit: '', validFrom: '', validTo: '', isActive: true,
  });

  const isExhausted = (c: PromoCode) => c.usageLimit !== null && c.usageCount >= c.usageLimit;

  const filtered = codes.filter(c => {
    const matchesSearch = !searchTerm || c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.isActive && !isExhausted(c)) ||
      (filterStatus === 'inactive' && !c.isActive) ||
      (filterStatus === 'exhausted' && isExhausted(c));
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingCode(null);
    setForm({ code: '', packageName: '', usageLimit: '', validFrom: '', validTo: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (c: PromoCode) => {
    setEditingCode(c);
    setForm({
      code: c.code, packageName: c.packageName,
      usageLimit: c.usageLimit !== null ? c.usageLimit.toString() : '',
      validFrom: c.validFrom, validTo: c.validTo, isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingCode) {
      setCodes(codes.map(c => c.id === editingCode.id ? {
        ...c,
        code: form.code.toUpperCase(),
        packageName: form.packageName,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        validFrom: form.validFrom,
        validTo: form.validTo,
        isActive: form.isActive,
      } : c));
    } else {
      setCodes([...codes, {
        id: `PC${String(codes.length + 1).padStart(3, '0')}`,
        code: form.code.toUpperCase(),
        packageName: form.packageName,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        usageCount: 0,
        validFrom: form.validFrom,
        validTo: form.validTo,
        isActive: form.isActive,
        createdAt: new Date().toISOString().split('T')[0],
      }]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setCodes(codes.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const usagePct = (c: PromoCode) => {
    if (!c.usageLimit) return null;
    return Math.round((c.usageCount / c.usageLimit) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-600 mt-1">Manage discount codes linked to promotional packages</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Codes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{codes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{codes.filter(c => c.isActive && !isExhausted(c)).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Exhausted</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{codes.filter(isExhausted).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Redemptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{codes.reduce((s, c) => s + c.usageCount, 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search codes or packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="exhausted">Exhausted</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((c) => {
              const exhausted = isExhausted(c);
              const pct = usagePct(c);
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="font-mono font-semibold text-gray-900">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.packageName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {c.usageCount} / {c.usageLimit !== null ? c.usageLimit : '∞'}
                    </div>
                    {pct !== null && (
                      <div className="mt-1 w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                    {exhausted && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        Exhausted
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{c.validFrom}</div>
                    <div className="text-xs text-gray-400">to {c.validTo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      exhausted ? 'bg-red-100 text-red-700' :
                      c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {exhausted ? 'Exhausted' : c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(c.id)}
                        className={`inline-flex items-center gap-1 ${c.isActive ? 'text-gray-500 hover:text-gray-700' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {c.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No promo codes found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingCode ? 'Edit Promo Code' : 'New Promo Code'}
        submitText={editingCode ? 'Update' : 'Create'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Promotional Package *</label>
            <select
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select package...</option>
              {MOCK_PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Leave blank for unlimited"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
              <input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid To *</label>
              <input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
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

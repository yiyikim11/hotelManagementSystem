import { useState } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, DollarSign, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface RatePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  dailyRates: DailyRate[];
}

interface DailyRate {
  id: string;
  roomType: string;
  date: string;
  rate: number;
  currency: string;
}

const MOCK_ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Junior Suite', 'Executive Suite', 'Presidential Suite'];

const initialRatePlans: RatePlan[] = [
  {
    id: 'RP001',
    code: 'BAR',
    name: 'Best Available Rate',
    description: 'Standard public rate with no restrictions',
    isActive: true,
    createdAt: '2024-01-01',
    dailyRates: [
      { id: 'DR001', roomType: 'Standard Room', date: '2026-06-01', rate: 120, currency: 'USD' },
      { id: 'DR002', roomType: 'Deluxe Room', date: '2026-06-01', rate: 180, currency: 'USD' },
      { id: 'DR003', roomType: 'Junior Suite', date: '2026-06-01', rate: 260, currency: 'USD' },
    ],
  },
  {
    id: 'RP002',
    code: 'CORP',
    name: 'Corporate Rate',
    description: 'Negotiated rate for corporate accounts',
    isActive: true,
    createdAt: '2024-01-05',
    dailyRates: [
      { id: 'DR004', roomType: 'Standard Room', date: '2026-06-01', rate: 105, currency: 'USD' },
      { id: 'DR005', roomType: 'Deluxe Room', date: '2026-06-01', rate: 160, currency: 'USD' },
    ],
  },
  {
    id: 'RP003',
    code: 'PKG',
    name: 'Package Rate',
    description: 'Inclusive rate bundled with breakfast and airport transfer',
    isActive: true,
    createdAt: '2024-02-10',
    dailyRates: [
      { id: 'DR006', roomType: 'Deluxe Room', date: '2026-06-01', rate: 220, currency: 'USD' },
      { id: 'DR007', roomType: 'Junior Suite', date: '2026-06-01', rate: 320, currency: 'USD' },
    ],
  },
  {
    id: 'RP004',
    code: 'OTA',
    name: 'OTA Rate',
    description: 'Rate for online travel agency channels',
    isActive: false,
    createdAt: '2024-03-01',
    dailyRates: [],
  },
];

export default function RatePlans() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>(initialRatePlans);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({ code: '', name: '', description: '', isActive: true });
  const [rateForm, setRateForm] = useState({ roomType: '', date: '', rate: '', currency: 'USD' });

  const handleAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ code: '', name: '', description: '', isActive: true });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: RatePlan) => {
    setEditingPlan(plan);
    setPlanForm({ code: plan.code, name: plan.name, description: plan.description, isActive: plan.isActive });
    setShowPlanModal(true);
  };

  const handleSubmitPlan = () => {
    if (editingPlan) {
      setRatePlans(ratePlans.map(p => p.id === editingPlan.id ? { ...p, ...planForm } : p));
    } else {
      const newPlan: RatePlan = {
        id: `RP${String(ratePlans.length + 1).padStart(3, '0')}`,
        code: planForm.code.toUpperCase(),
        name: planForm.name,
        description: planForm.description,
        isActive: planForm.isActive,
        createdAt: new Date().toISOString().split('T')[0],
        dailyRates: [],
      };
      setRatePlans([...ratePlans, newPlan]);
    }
    setShowPlanModal(false);
  };

  const handleAddRate = (planId: string) => {
    setSelectedPlanId(planId);
    setRateForm({ roomType: '', date: '', rate: '', currency: 'USD' });
    setShowRateModal(true);
  };

  const handleSubmitRate = () => {
    if (!selectedPlanId) return;
    const newRate: DailyRate = {
      id: `DR${Date.now()}`,
      roomType: rateForm.roomType,
      date: rateForm.date,
      rate: parseFloat(rateForm.rate),
      currency: rateForm.currency,
    };
    setRatePlans(ratePlans.map(p =>
      p.id === selectedPlanId ? { ...p, dailyRates: [...p.dailyRates, newRate] } : p
    ));
    setShowRateModal(false);
  };

  const togglePlanActive = (planId: string) => {
    setRatePlans(ratePlans.map(p => p.id === planId ? { ...p, isActive: !p.isActive } : p));
  };

  const deleteRate = (planId: string, rateId: string) => {
    setRatePlans(ratePlans.map(p =>
      p.id === planId ? { ...p, dailyRates: p.dailyRates.filter(r => r.id !== rateId) } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate Plans</h1>
          <p className="text-gray-600 mt-1">Manage rate plans and daily room rates</p>
        </div>
        <button
          onClick={handleAddPlan}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Rate Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Plans</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{ratePlans.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Active Plans</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{ratePlans.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Daily Rates</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{ratePlans.reduce((s, p) => s + p.dailyRates.length, 0)}</p>
        </div>
      </div>

      {/* Rate Plans List */}
      <div className="space-y-3">
        {ratePlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Plan Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedPlan === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{plan.code}</span>
                    <span className="font-semibold text-gray-900">{plan.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddRate(plan.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Rate
                </button>
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePlanActive(plan.id)}
                  className={`p-1.5 rounded ${plan.isActive ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}
                >
                  {plan.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Daily Rates Table */}
            {expandedPlan === plan.id && (
              <div className="border-t border-gray-100">
                {plan.dailyRates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No daily rates configured. Click "Add Rate" to begin.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plan.dailyRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">{rate.roomType}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {rate.date}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold text-gray-900">${rate.rate.toFixed(2)}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{rate.currency}</td>
                          <td className="px-6 py-3 text-sm">
                            <button
                              onClick={() => deleteRate(plan.id, rate.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      <FormModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSubmit={handleSubmitPlan}
        title={editingPlan ? 'Edit Rate Plan' : 'New Rate Plan'}
        submitText={editingPlan ? 'Update' : 'Create'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Code *</label>
            <input
              type="text"
              value={planForm.code}
              onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.toUpperCase() })}
              placeholder="BAR"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name *</label>
            <input
              type="text"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="Best Available Rate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              rows={3}
              placeholder="Standard public rate with no restrictions"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={planForm.isActive}
                onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Add Daily Rate Modal */}
      <FormModal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        onSubmit={handleSubmitRate}
        title="Add Daily Rate"
        submitText="Add Rate"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
            <select
              value={rateForm.roomType}
              onChange={(e) => setRateForm({ ...rateForm, roomType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select room type...</option>
              {MOCK_ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={rateForm.date}
              onChange={(e) => setRateForm({ ...rateForm, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={rateForm.rate}
              onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })}
              placeholder="150.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

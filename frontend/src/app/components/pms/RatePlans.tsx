import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, DollarSign, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import {
  ratePlansApi,
  type RatePlan,
  type RatePlanRequest,
  type DailyRoomRateResponse,
} from '../../services/pms/ratePlansApi';
import { roomTypesApi, type RoomType } from '../../services/pms/roomTypesApi';
import FormModal from '../shared/FormModal';

export default function RatePlans() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planRates, setPlanRates] = useState<Record<string, DailyRoomRateResponse[]>>({});
  const [rateFilter, setRateFilter] = useState<Record<string, { roomTypeId: string; from: string; to: string }>>({});

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<{ code: string; name: string; description: string; isActive: boolean }>(
    { code: '', name: '', description: '', isActive: true }
  );
  const [rateForm, setRateForm] = useState({ roomTypeId: '', rateDate: '', rate: '' });

  const defaultFrom = () => new Date().toISOString().split('T')[0];
  const defaultTo = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [plansPage, rtPage] = await Promise.all([
        ratePlansApi.list(),
        roomTypesApi.list(),
      ]);
      setRatePlans(plansPage.content);
      setRoomTypes(rtPage.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rate plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadRates = async (planId: string) => {
    const filter = rateFilter[planId];
    if (!filter?.roomTypeId || !filter?.from || !filter?.to) return;
    try {
      const rates = await ratePlansApi.getRates(planId, filter.roomTypeId, filter.from, filter.to);
      setPlanRates(prev => ({ ...prev, [planId]: rates }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates');
    }
  };

  const handleExpandToggle = (planId: string) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
      if (!rateFilter[planId]) {
        setRateFilter(prev => ({
          ...prev,
          [planId]: { roomTypeId: roomTypes[0]?.id ?? '', from: defaultFrom(), to: defaultTo() },
        }));
      }
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ code: '', name: '', description: '', isActive: true });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: RatePlan) => {
    setEditingPlan(plan);
    setPlanForm({ code: plan.code, name: plan.name, description: plan.description ?? '', isActive: plan.isActive });
    setShowPlanModal(true);
  };

  const handleSubmitPlan = async () => {
    const req: RatePlanRequest = { ...planForm };
    try {
      if (editingPlan) {
        await ratePlansApi.update(editingPlan.id, req);
      } else {
        await ratePlansApi.create(req);
      }
      setShowPlanModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save rate plan');
    }
  };

  const handleToggleActive = async (plan: RatePlan) => {
    try {
      await ratePlansApi.update(plan.id, {
        code: plan.code,
        name: plan.name,
        description: plan.description ?? undefined,
        isActive: !plan.isActive,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update rate plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this rate plan?')) return;
    try {
      await ratePlansApi.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete rate plan');
    }
  };

  const handleAddRate = (planId: string) => {
    setSelectedPlanId(planId);
    setRateForm({ roomTypeId: roomTypes[0]?.id ?? '', rateDate: defaultFrom(), rate: '' });
    setShowRateModal(true);
  };

  const handleSubmitRate = async () => {
    if (!selectedPlanId) return;
    try {
      await ratePlansApi.upsertRate({
        ratePlanId: selectedPlanId,
        roomTypeId: rateForm.roomTypeId,
        rateDate: rateForm.rateDate,
        rate: parseFloat(rateForm.rate),
      });
      setShowRateModal(false);
      if (expandedPlan === selectedPlanId) loadRates(selectedPlanId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save rate');
    }
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

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
          <p className="text-sm text-gray-500">Inactive Plans</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{ratePlans.filter(p => !p.isActive).length}</p>
        </div>
      </div>

      {/* Rate Plans List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-3">
          {ratePlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Plan Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleExpandToggle(plan.id)}
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
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                    )}
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
                  <button onClick={() => handleEditPlan(plan)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`p-1.5 rounded ${plan.isActive ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}
                    title={plan.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {plan.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded: rate lookup */}
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-100">
                  {/* Filter row */}
                  <div className="px-6 py-3 bg-gray-50 flex flex-wrap items-end gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Room Type</label>
                      <select
                        value={rateFilter[plan.id]?.roomTypeId ?? ''}
                        onChange={(e) =>
                          setRateFilter(prev => ({ ...prev, [plan.id]: { ...(prev[plan.id] ?? {}), roomTypeId: e.target.value } as typeof prev[string] }))
                        }
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select…</option>
                        {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input
                        type="date"
                        value={rateFilter[plan.id]?.from ?? defaultFrom()}
                        onChange={(e) =>
                          setRateFilter(prev => ({ ...prev, [plan.id]: { ...(prev[plan.id] ?? {}), from: e.target.value } as typeof prev[string] }))
                        }
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input
                        type="date"
                        value={rateFilter[plan.id]?.to ?? defaultTo()}
                        onChange={(e) =>
                          setRateFilter(prev => ({ ...prev, [plan.id]: { ...(prev[plan.id] ?? {}), to: e.target.value } as typeof prev[string] }))
                        }
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => loadRates(plan.id)}
                      className="px-4 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                    >
                      Load Rates
                    </button>
                  </div>

                  {/* Rates table */}
                  {planRates[plan.id] ? (
                    planRates[plan.id].length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No rates for this period. Click "Add Rate" to set one.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {planRates[plan.id].map((rate) => (
                            <tr key={rate.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3 text-sm text-gray-900">{rate.roomTypeCode}</td>
                              <td className="px-6 py-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {rate.rateDate}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-sm font-semibold text-gray-900">${Number(rate.rate).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      Select a room type and date range, then click "Load Rates".
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {ratePlans.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-white rounded-lg shadow">
              No rate plans found.
            </div>
          )}
        </div>
      )}

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
        title="Add / Update Daily Rate"
        submitText="Save Rate"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
            <select
              value={rateForm.roomTypeId}
              onChange={(e) => setRateForm({ ...rateForm, roomTypeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select room type…</option>
              {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={rateForm.rateDate}
              onChange={(e) => setRateForm({ ...rateForm, rateDate: e.target.value })}
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

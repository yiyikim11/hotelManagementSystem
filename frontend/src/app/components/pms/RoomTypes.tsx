import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Bed, Users, DollarSign } from 'lucide-react';
import { roomTypesApi, type RoomType, type RoomTypeRequest } from '../../services/pms/roomTypesApi';
import FormModal from '../shared/FormModal';

const emptyForm: Omit<RoomTypeRequest, 'baseOccupancy' | 'maxOccupancy' | 'baseRate'> & {
  baseOccupancy: string; maxOccupancy: string; baseRate: string;
} = {
  code: '', name: '', description: '',
  baseOccupancy: '2', maxOccupancy: '2', baseRate: '', currency: 'USD',
};

export default function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await roomTypesApi.list();
      setRoomTypes(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load room types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    setEditingType(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (rt: RoomType) => {
    setEditingType(rt);
    setForm({
      code: rt.code, name: rt.name, description: rt.description ?? '',
      baseOccupancy: String(rt.baseOccupancy), maxOccupancy: String(rt.maxOccupancy),
      baseRate: String(rt.baseRate), currency: rt.currency,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payload: RoomTypeRequest = {
      code: form.code, name: form.name, description: form.description,
      baseOccupancy: parseInt(form.baseOccupancy),
      maxOccupancy: parseInt(form.maxOccupancy),
      baseRate: parseFloat(form.baseRate),
      currency: form.currency,
    };
    try {
      if (editingType) {
        await roomTypesApi.update(editingType.id, payload);
      } else {
        await roomTypesApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save room type');
    }
  };

  const handleDelete = async (rt: RoomType) => {
    if (!confirm(`Delete room type "${rt.name}"?`)) return;
    try {
      await roomTypesApi.delete(rt.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete room type');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
          <p className="text-gray-600 mt-1">Manage room categories and base rates</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> Add Room Type
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map(rt => (
            <div key={rt.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{rt.code}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{rt.name}</h3>
                  {rt.description && <p className="text-sm text-gray-500 mt-1">{rt.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(rt)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rt)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span>Base: {rt.baseOccupancy}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Max: {rt.maxOccupancy}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                  <DollarSign className="w-4 h-4" />
                  <span>{Number(rt.baseRate).toFixed(0)}/{rt.currency}</span>
                </div>
              </div>
            </div>
          ))}
          {roomTypes.length === 0 && (
            <div className="col-span-3 p-8 text-center text-gray-500">No room types found</div>
          )}
        </div>
      )}

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingType ? `Edit — ${editingType.name}` : 'Add Room Type'}
        submitText={editingType ? 'Save Changes' : 'Create Room Type'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Code *', key: 'code', placeholder: 'STD' },
            { label: 'Name *', key: 'name', placeholder: 'Standard Room' },
            { label: 'Base Occupancy *', key: 'baseOccupancy', type: 'number' },
            { label: 'Max Occupancy *', key: 'maxOccupancy', type: 'number' },
            { label: 'Base Rate *', key: 'baseRate', type: 'number', placeholder: '120.00' },
            { label: 'Currency', key: 'currency', placeholder: 'USD' },
          ].map(({ label, key, type = 'text', placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

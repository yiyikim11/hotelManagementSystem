import { useState } from 'react';
import { Plus, Edit2, Bed, Users, DollarSign } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface RoomType {
  id: string;
  code: string;
  name: string;
  description: string;
  baseOccupancy: number;
  maxOccupancy: number;
  baseRate: number;
  currency: string;
  createdAt: string;
}

const initialRoomTypes: RoomType[] = [
  {
    id: 'RT001', code: 'STD', name: 'Standard Room', description: 'Comfortable room with essential amenities',
    baseOccupancy: 2, maxOccupancy: 2, baseRate: 120, currency: 'USD', createdAt: '2024-01-01',
  },
  {
    id: 'RT002', code: 'DLX', name: 'Deluxe Room', description: 'Spacious room with premium furnishings and city view',
    baseOccupancy: 2, maxOccupancy: 3, baseRate: 180, currency: 'USD', createdAt: '2024-01-01',
  },
  {
    id: 'RT003', code: 'JRS', name: 'Junior Suite', description: 'Suite with separate living area and kitchenette',
    baseOccupancy: 2, maxOccupancy: 4, baseRate: 260, currency: 'USD', createdAt: '2024-01-01',
  },
  {
    id: 'RT004', code: 'EXS', name: 'Executive Suite', description: 'Full suite with dedicated work area and lounge access',
    baseOccupancy: 2, maxOccupancy: 4, baseRate: 400, currency: 'USD', createdAt: '2024-01-01',
  },
  {
    id: 'RT005', code: 'PRS', name: 'Presidential Suite', description: 'Top-floor luxury suite with panoramic views',
    baseOccupancy: 2, maxOccupancy: 6, baseRate: 900, currency: 'USD', createdAt: '2024-01-01',
  },
];

export default function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '',
    baseOccupancy: '2', maxOccupancy: '2', baseRate: '', currency: 'USD',
  });

  const handleAdd = () => {
    setEditingType(null);
    setForm({ code: '', name: '', description: '', baseOccupancy: '2', maxOccupancy: '2', baseRate: '', currency: 'USD' });
    setShowModal(true);
  };

  const handleEdit = (rt: RoomType) => {
    setEditingType(rt);
    setForm({
      code: rt.code,
      name: rt.name,
      description: rt.description,
      baseOccupancy: rt.baseOccupancy.toString(),
      maxOccupancy: rt.maxOccupancy.toString(),
      baseRate: rt.baseRate.toString(),
      currency: rt.currency,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingType) {
      setRoomTypes(roomTypes.map(rt => rt.id === editingType.id ? {
        ...rt,
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description,
        baseOccupancy: parseInt(form.baseOccupancy),
        maxOccupancy: parseInt(form.maxOccupancy),
        baseRate: parseFloat(form.baseRate),
        currency: form.currency,
      } : rt));
    } else {
      setRoomTypes([...roomTypes, {
        id: `RT${String(roomTypes.length + 1).padStart(3, '0')}`,
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description,
        baseOccupancy: parseInt(form.baseOccupancy),
        maxOccupancy: parseInt(form.maxOccupancy),
        baseRate: parseFloat(form.baseRate),
        currency: form.currency,
        createdAt: new Date().toISOString().split('T')[0],
      }]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
          <p className="text-gray-600 mt-1">Define room categories, occupancy limits, and base rates</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Room Type
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Room Types</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{roomTypes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Lowest Base Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${Math.min(...roomTypes.map(rt => rt.baseRate)).toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Highest Base Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${Math.max(...roomTypes.map(rt => rt.baseRate)).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Room Types Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Occ.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Occ.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roomTypes.map((rt) => (
              <tr key={rt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{rt.code}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{rt.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{rt.description}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Users className="w-3 h-3" />
                    {rt.baseOccupancy}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Users className="w-3 h-3" />
                    {rt.maxOccupancy}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <DollarSign className="w-3 h-3 text-gray-400" />
                    {rt.baseRate.toFixed(2)} {rt.currency}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleEdit(rt)}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingType ? 'Edit Room Type' : 'New Room Type'}
        submitText={editingType ? 'Update' : 'Create'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="DLX"
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Deluxe Room"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Spacious room with premium furnishings..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Occupancy *</label>
            <input
              type="number"
              min="1"
              value={form.baseOccupancy}
              onChange={(e) => setForm({ ...form, baseOccupancy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Occupancy *</label>
            <input
              type="number"
              min="1"
              value={form.maxOccupancy}
              onChange={(e) => setForm({ ...form, maxOccupancy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Rate *</label>
            <input
              type="number"
              step="0.01"
              value={form.baseRate}
              onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
              placeholder="180.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

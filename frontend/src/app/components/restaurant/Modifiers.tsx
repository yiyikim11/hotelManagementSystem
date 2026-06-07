import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings2, Link } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface Modifier {
  id: string;
  name: string;
  priceDelta: number;
  isActive: boolean;
  assignedItems: string[];
}

const MOCK_MENU_ITEMS = [
  'Grilled Salmon', 'Club Sandwich', 'Caesar Salad', 'Beef Burger', 'Pasta Carbonara',
  'Margherita Pizza', 'French Onion Soup', 'Chocolate Fondant', 'Americano', 'Fresh Orange Juice',
];

const initialModifiers: Modifier[] = [
  { id: 'MOD001', name: 'Extra Cheese', priceDelta: 2.50, isActive: true, assignedItems: ['Club Sandwich', 'Beef Burger', 'Margherita Pizza'] },
  { id: 'MOD002', name: 'Add Avocado', priceDelta: 3.00, isActive: true, assignedItems: ['Club Sandwich', 'Caesar Salad'] },
  { id: 'MOD003', name: 'Gluten-Free Base', priceDelta: 4.00, isActive: true, assignedItems: ['Margherita Pizza', 'Pasta Carbonara'] },
  { id: 'MOD004', name: 'No Salt', priceDelta: 0, isActive: true, assignedItems: ['Grilled Salmon', 'Caesar Salad', 'French Onion Soup'] },
  { id: 'MOD005', name: 'Double Portion', priceDelta: 12.00, isActive: true, assignedItems: ['Grilled Salmon', 'Pasta Carbonara'] },
  { id: 'MOD006', name: 'Extra Shot (Coffee)', priceDelta: 1.50, isActive: true, assignedItems: ['Americano'] },
  { id: 'MOD007', name: 'Spicy Level: Extra Hot', priceDelta: 0, isActive: false, assignedItems: [] },
];

export default function RestaurantModifiers() {
  const [modifiers, setModifiers] = useState<Modifier[]>(initialModifiers);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMod, setEditingMod] = useState<Modifier | null>(null);
  const [assigningMod, setAssigningMod] = useState<Modifier | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', priceDelta: '', isActive: true });

  const filtered = modifiers.filter(m =>
    !searchTerm || m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMod(null);
    setForm({ name: '', priceDelta: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (mod: Modifier) => {
    setEditingMod(mod);
    setForm({ name: mod.name, priceDelta: mod.priceDelta.toString(), isActive: mod.isActive });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setModifiers(modifiers.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    if (editingMod) {
      setModifiers(modifiers.map(m => m.id === editingMod.id ? {
        ...m, name: form.name, priceDelta: parseFloat(form.priceDelta) || 0, isActive: form.isActive,
      } : m));
    } else {
      setModifiers([...modifiers, {
        id: `MOD${String(modifiers.length + 1).padStart(3, '0')}`,
        name: form.name,
        priceDelta: parseFloat(form.priceDelta) || 0,
        isActive: form.isActive,
        assignedItems: [],
      }]);
    }
    setShowModal(false);
  };

  const handleAssign = (mod: Modifier) => {
    setAssigningMod(mod);
    setSelectedItems([...mod.assignedItems]);
    setShowAssignModal(true);
  };

  const handleSaveAssign = () => {
    if (!assigningMod) return;
    setModifiers(modifiers.map(m => m.id === assigningMod.id ? { ...m, assignedItems: selectedItems } : m));
    setShowAssignModal(false);
  };

  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Modifiers</h1>
          <p className="text-gray-600 mt-1">Manage item add-ons, substitutions, and customizations</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Modifier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Modifiers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{modifiers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{modifiers.filter(m => m.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Paid Modifiers</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{modifiers.filter(m => m.priceDelta > 0).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-sm">
          <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modifiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modifier Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Delta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((mod) => (
              <tr key={mod.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {mod.priceDelta === 0
                    ? <span className="text-gray-400">Free</span>
                    : <span className="text-green-600">+${mod.priceDelta.toFixed(2)}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${mod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {mod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {mod.assignedItems.length === 0 ? (
                    <span className="text-xs text-gray-400">Not assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {mod.assignedItems.slice(0, 3).map(item => (
                        <span key={item} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {item}
                        </span>
                      ))}
                      {mod.assignedItems.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{mod.assignedItems.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(mod)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => handleAssign(mod)} className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1">
                      <Link className="w-4 h-4" />
                      Assign
                    </button>
                    <button onClick={() => handleDelete(mod.id)} className="text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Settings2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No modifiers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingMod ? 'Edit Modifier' : 'New Modifier'}
        submitText={editingMod ? 'Update' : 'Create'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modifier Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Extra Cheese"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Delta ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.priceDelta}
              onChange={(e) => setForm({ ...form, priceDelta: e.target.value })}
              placeholder="0.00 for free"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave 0 for free modifiers (e.g. dietary requests)</p>
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

      {/* Assign to Menu Items Modal */}
      <FormModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleSaveAssign}
        title={`Assign "${assigningMod?.name}" to Menu Items`}
        submitText="Save Assignments"
        size="md"
      >
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {MOCK_MENU_ITEMS.map(item => (
            <label key={item} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-800">{item}</span>
            </label>
          ))}
        </div>
      </FormModal>
    </div>
  );
}

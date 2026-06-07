import { useState } from 'react';
import { Plus, Edit2, Users, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface RestaurantTable {
  id: string;
  tableNumber: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentGuest?: string;
  notes?: string;
}

const STATUS_COLORS: Record<RestaurantTable['status'], string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  reserved: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cleaning: 'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_DOT: Record<RestaurantTable['status'], string> = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-yellow-400',
  cleaning: 'bg-blue-500',
};

const initialTables: RestaurantTable[] = [
  { id: 'T001', tableNumber: '1', seats: 2, status: 'available' },
  { id: 'T002', tableNumber: '2', seats: 2, status: 'occupied', currentGuest: 'Johnson, M.' },
  { id: 'T003', tableNumber: '3', seats: 4, status: 'reserved', currentGuest: 'Smith Family' },
  { id: 'T004', tableNumber: '4', seats: 4, status: 'available' },
  { id: 'T005', tableNumber: '5', seats: 6, status: 'occupied', currentGuest: 'Conference Group A' },
  { id: 'T006', tableNumber: '6', seats: 6, status: 'cleaning' },
  { id: 'T007', tableNumber: '7', seats: 8, status: 'available' },
  { id: 'T008', tableNumber: '8', seats: 2, status: 'reserved', currentGuest: 'Davis, R.' },
  { id: 'T009', tableNumber: 'P1', seats: 10, status: 'available', notes: 'Private dining room' },
  { id: 'T010', tableNumber: 'B1', seats: 4, status: 'occupied', currentGuest: 'Bar seating', notes: 'Bar area' },
];

export default function RestaurantTables() {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | RestaurantTable['status']>('all');
  const [form, setForm] = useState({
    tableNumber: '', seats: '4', status: 'available' as RestaurantTable['status'],
    currentGuest: '', notes: '',
  });

  const filtered = tables.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const handleAdd = () => {
    setEditingTable(null);
    setForm({ tableNumber: '', seats: '4', status: 'available', currentGuest: '', notes: '' });
    setShowModal(true);
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setForm({
      tableNumber: table.tableNumber,
      seats: table.seats.toString(),
      status: table.status,
      currentGuest: table.currentGuest || '',
      notes: table.notes || '',
    });
    setShowModal(true);
  };

  const handleStatusChange = (id: string, status: RestaurantTable['status']) => {
    setTables(tables.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleSubmit = () => {
    if (editingTable) {
      setTables(tables.map(t => t.id === editingTable.id ? {
        ...t,
        tableNumber: form.tableNumber,
        seats: parseInt(form.seats),
        status: form.status,
        currentGuest: form.currentGuest || undefined,
        notes: form.notes || undefined,
      } : t));
    } else {
      setTables([...tables, {
        id: `T${String(tables.length + 1).padStart(3, '0')}`,
        tableNumber: form.tableNumber,
        seats: parseInt(form.seats),
        status: form.status,
        currentGuest: form.currentGuest || undefined,
        notes: form.notes || undefined,
      }]);
    }
    setShowModal(false);
  };

  const counts = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Manage restaurant seating and table status</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{counts.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{counts.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-gray-900">{counts.reserved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cleaning</p>
              <p className="text-2xl font-bold text-gray-900">{counts.cleaning}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'available', 'occupied', 'reserved', 'cleaning'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Tables' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Table {table.tableNumber}</h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{table.seats} seats</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${STATUS_DOT[table.status]}`} />
              </div>

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 text-xs rounded-full capitalize ${STATUS_COLORS[table.status]}`}>
                  {table.status}
                </span>
              </div>

              {table.currentGuest && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Guest</p>
                  <p className="text-sm text-gray-900 font-medium">{table.currentGuest}</p>
                </div>
              )}

              {table.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{table.notes}</p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">Update Status</label>
                  <select
                    value={table.status}
                    onChange={(e) => handleStatusChange(table.id, e.target.value as RestaurantTable['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
                <button
                  onClick={() => handleEdit(table)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Table
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tables found matching the current filter
          </div>
        )}
      </div>

      {/* Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingTable ? 'Edit Table' : 'Add Table'}
        submitText={editingTable ? 'Update' : 'Add'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Number *</label>
              <input
                type="text"
                value={form.tableNumber}
                onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                placeholder="1 or P1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seats *</label>
              <input
                type="number"
                min="1"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RestaurantTable['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Guest</label>
            <input
              type="text"
              value={form.currentGuest}
              onChange={(e) => setForm({ ...form, currentGuest: e.target.value })}
              placeholder="Guest name or group"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Private dining room, Bar area"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface Department {
  id: string;
  name: string;
  stockValue: number;
  notes?: string;
}

const initialDepartments: Department[] = [
  { id: 'D001', name: 'Housekeeping', stockValue: 14200, notes: 'Linens, toiletries, cleaning supplies' },
  { id: 'D002', name: 'Front Office', stockValue: 3400, notes: 'Stationery, printing, guest amenities' },
  { id: 'D003', name: 'Maintenance', stockValue: 22500, notes: 'Tools, spare parts, electrical, plumbing' },
  { id: 'D004', name: 'Food & Beverage', stockValue: 18900, notes: 'Restaurant and bar supplies' },
  { id: 'D005', name: 'Administration', stockValue: 2100, notes: 'Office and HR supplies' },
  { id: 'D006', name: 'Security', stockValue: 4500, notes: 'Uniforms, equipment' },
];

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', stockValue: '', notes: '' });

  const handleAdd = () => {
    setEditingDept(null);
    setForm({ name: '', stockValue: '', notes: '' });
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      stockValue: dept.stockValue.toString(),
      notes: dept.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  const handleSubmit = () => {
    if (editingDept) {
      setDepartments(departments.map(d => d.id === editingDept.id ? {
        ...d,
        name: form.name,
        stockValue: parseFloat(form.stockValue) || 0,
        notes: form.notes || undefined,
      } : d));
    } else {
      setDepartments([...departments, {
        id: `D${String(departments.length + 1).padStart(3, '0')}`,
        name: form.name,
        stockValue: parseFloat(form.stockValue) || 0,
        notes: form.notes || undefined,
      }]);
    }
    setShowModal(false);
  };

  const totalStockValue = departments.reduce((s, d) => s + d.stockValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage hotel departments and their inventory allocation</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Departments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{departments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Stock Value Allocated</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalStockValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const pct = Math.round((dept.stockValue / totalStockValue) * 100);
          return (
            <div key={dept.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-xs text-gray-500">{dept.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(dept)} className="text-gray-400 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {dept.notes && (
                <p className="text-sm text-gray-500 mb-4">{dept.notes}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stock Value</span>
                  <span className="font-semibold text-gray-900">${dept.stockValue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">{pct}% of total stock value</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Share</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{dept.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${dept.stockValue.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Math.round((dept.stockValue / totalStockValue) * 100)}%
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{dept.notes || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(dept)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        submitText={editingDept ? 'Update' : 'Add'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Housekeeping"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Stock Value ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.stockValue}
              onChange={(e) => setForm({ ...form, stockValue: e.target.value })}
              placeholder="5000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Types of inventory this department uses..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

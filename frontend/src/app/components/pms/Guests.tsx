import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, User, Eye, Edit2, Star, Ban, Trash2 } from 'lucide-react';
import { guestsApi, type Guest, type GuestRequest } from '../../services/pms/guestsApi';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

const emptyForm: GuestRequest = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', address: '', nationality: '',
  idType: '', idNumber: '', issuingCountry: '', preferences: '',
  vipStatus: false, blacklisted: false,
};

export default function PMSGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewGuest, setViewGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestRequest>(emptyForm);
  const [editData, setEditData] = useState<GuestRequest>(emptyForm);

  const loadGuests = useCallback(async (q?: string) => {
    setLoading(true);
    setError('');
    try {
      const page = q ? await guestsApi.search(q) : await guestsApi.list();
      setGuests(page.content);
      setTotalElements(page.totalElements);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => { loadGuests(); }, [loadGuests]);

  // Debounced search when query changes
  useEffect(() => {
    if (!searchTerm) return;
    const timer = setTimeout(() => loadGuests(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadGuests]);

  const handleCreate = async () => {
    try {
      await guestsApi.create(formData);
      setShowAddModal(false);
      setFormData(emptyForm);
      loadGuests(searchTerm || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create guest');
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditData({
      firstName: guest.firstName, lastName: guest.lastName,
      email: guest.email, phone: guest.phone,
      dateOfBirth: guest.dateOfBirth ?? '', gender: guest.gender ?? '',
      address: guest.address ?? '', nationality: guest.nationality ?? '',
      idType: guest.idType ?? '', idNumber: guest.idNumber ?? '',
      issuingCountry: guest.issuingCountry ?? '', preferences: guest.preferences ?? '',
      vipStatus: guest.vipStatus, blacklisted: guest.blacklisted,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingGuest) return;
    try {
      await guestsApi.update(editingGuest.id, editData);
      setShowEditModal(false);
      setEditingGuest(null);
      loadGuests(searchTerm || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update guest');
    }
  };

  const handleDelete = async (guest: Guest) => {
    if (!confirm(`Delete guest ${guest.firstName} ${guest.lastName}?`)) return;
    try {
      await guestsApi.delete(guest.id);
      loadGuests(searchTerm || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete guest');
    }
  };

  const formFields = (data: GuestRequest, onChange: (d: GuestRequest) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: 'First Name *', key: 'firstName', type: 'text', required: true },
        { label: 'Last Name *', key: 'lastName', type: 'text', required: true },
        { label: 'Email *', key: 'email', type: 'email', required: true },
        { label: 'Phone *', key: 'phone', type: 'tel', required: true },
        { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
        { label: 'Nationality', key: 'nationality', type: 'text' },
        { label: 'ID Type', key: 'idType', type: 'text' },
        { label: 'ID Number', key: 'idNumber', type: 'text' },
      ].map(({ label, key, type, required }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            value={(data as unknown as Record<string, string>)[key] ?? ''}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={data.address ?? ''}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="vip" checked={data.vipStatus}
          onChange={(e) => onChange({ ...data, vipStatus: e.target.checked })} />
        <label htmlFor="vip" className="text-sm text-gray-700">VIP Status</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="blacklisted" checked={data.blacklisted}
          onChange={(e) => onChange({ ...data, blacklisted: e.target.checked })} />
        <label htmlFor="blacklisted" className="text-sm text-gray-700">Blacklisted</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600 mt-1">Manage guest profiles ({totalElements} total)</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> New Guest
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Guest', 'Email', 'Phone', 'Stays', 'Spent', 'Flags', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests.map(guest => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-full" />
                      <span className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{guest.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{guest.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.totalStays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(guest.totalSpent).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {guest.vipStatus && <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Star className="w-3 h-3" />VIP</span>}
                      {guest.blacklisted && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1"><Ban className="w-3 h-3" />Blacklisted</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewGuest(guest)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(guest)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(guest)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No guests found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <FormModal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormData(emptyForm); }}
        onSubmit={handleCreate} title="Add New Guest" submitText="Create Guest" size="lg">
        {formFields(formData, setFormData)}
      </FormModal>

      <FormModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingGuest(null); }}
        onSubmit={handleEditSubmit} title={`Edit Guest — ${editingGuest?.firstName} ${editingGuest?.lastName}`}
        submitText="Save Changes" size="lg">
        {formFields(editData, setEditData)}
      </FormModal>

      {viewGuest && (
        <Modal isOpen onClose={() => setViewGuest(null)} title="Guest Details" size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Name', `${viewGuest.firstName} ${viewGuest.lastName}`],
              ['Email', viewGuest.email],
              ['Phone', viewGuest.phone],
              ['Nationality', viewGuest.nationality],
              ['ID Type', viewGuest.idType],
              ['ID Number', viewGuest.idNumber],
              ['Total Stays', String(viewGuest.totalStays)],
              ['Total Spent', `$${Number(viewGuest.totalSpent).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500">{label}</p>
                <p className="font-medium text-gray-900">{value || '—'}</p>
              </div>
            ))}
            {viewGuest.preferences && (
              <div className="col-span-2">
                <p className="text-gray-500">Preferences</p>
                <p className="text-gray-900">{viewGuest.preferences}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

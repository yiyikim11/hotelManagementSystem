import { useState } from 'react';
import { Plus, Search, User, Eye, Edit2, Star, Ban } from 'lucide-react';
import { dataStore } from '../../data/store';
import { Guest } from '../../types';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

export default function PMSGuests() {
  const [guests, setGuests] = useState(dataStore.getGuests());
  const [reservations] = useState(dataStore.getReservations());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewGuest, setViewGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    nationality: '',
    idType: '',
    idNumber: '',
    issuingCountry: '',
    idDocumentImage: '',
    preferences: '',
    vipStatus: false,
    blacklisted: false,
  });

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    nationality: '',
    idType: '',
    idNumber: '',
    issuingCountry: '',
    idDocumentImage: '',
    preferences: '',
    vipStatus: false,
    blacklisted: false,
  });

  const filteredGuests = guests.filter(guest =>
    !searchTerm ||
    guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  );

  const handleSubmit = () => {
    const newGuest: Guest = {
      id: `G${String(guests.length + 1).padStart(3, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      address: formData.address || undefined,
      nationality: formData.nationality || undefined,
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || undefined,
      issuingCountry: formData.issuingCountry || undefined,
      idDocumentImage: formData.idDocumentImage || undefined,
      preferences: formData.preferences || undefined,
      vipStatus: formData.vipStatus,
      blacklisted: formData.blacklisted,
      totalStays: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };

    setGuests([...guests, newGuest]);
    dataStore.guests.push(newGuest);
    setShowAddModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      nationality: '',
      idType: '',
      idNumber: '',
      issuingCountry: '',
      idDocumentImage: '',
      preferences: '',
      vipStatus: false,
      blacklisted: false,
    });
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      dateOfBirth: guest.dateOfBirth || '',
      gender: guest.gender || '',
      address: guest.address || '',
      nationality: guest.nationality || '',
      idType: guest.idType || '',
      idNumber: guest.idNumber || '',
      issuingCountry: guest.issuingCountry || '',
      idDocumentImage: guest.idDocumentImage || '',
      preferences: guest.preferences || '',
      vipStatus: guest.vipStatus ?? false,
      blacklisted: guest.blacklisted ?? false,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingGuest) return;

    const updatedGuests = guests.map(g =>
      g.id === editingGuest.id ? {
        ...g,
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        phone: editData.phone,
        dateOfBirth: editData.dateOfBirth || undefined,
        gender: editData.gender || undefined,
        address: editData.address || undefined,
        nationality: editData.nationality || undefined,
        idType: editData.idType || undefined,
        idNumber: editData.idNumber || undefined,
        issuingCountry: editData.issuingCountry || undefined,
        idDocumentImage: editData.idDocumentImage || undefined,
        preferences: editData.preferences || undefined,
        vipStatus: editData.vipStatus,
        blacklisted: editData.blacklisted,
      } : g
    );

    setGuests(updatedGuests);

    const guestIndex = dataStore.guests.findIndex(g => g.id === editingGuest.id);
    if (guestIndex !== -1) {
      dataStore.guests[guestIndex] = {
        ...dataStore.guests[guestIndex],
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        phone: editData.phone,
        dateOfBirth: editData.dateOfBirth || undefined,
        gender: editData.gender || undefined,
        address: editData.address || undefined,
        nationality: editData.nationality || undefined,
        idType: editData.idType || undefined,
        idNumber: editData.idNumber || undefined,
        issuingCountry: editData.issuingCountry || undefined,
        idDocumentImage: editData.idDocumentImage || undefined,
        preferences: editData.preferences || undefined,
        vipStatus: editData.vipStatus,
        blacklisted: editData.blacklisted,
      };
    }

    setShowEditModal(false);
    setEditingGuest(null);
  };

  const handleToggleVip = (guestId: string) => {
    const updated = guests.map(g => g.id === guestId ? { ...g, vipStatus: !g.vipStatus } : g);
    setGuests(updated);
    const idx = dataStore.guests.findIndex(g => g.id === guestId);
    if (idx !== -1) dataStore.guests[idx] = { ...dataStore.guests[idx], vipStatus: !dataStore.guests[idx].vipStatus };
  };

  const handleToggleBlacklist = (guestId: string) => {
    const updated = guests.map(g => g.id === guestId ? { ...g, blacklisted: !g.blacklisted } : g);
    setGuests(updated);
    const idx = dataStore.guests.findIndex(g => g.id === guestId);
    if (idx !== -1) dataStore.guests[idx] = { ...dataStore.guests[idx], blacklisted: !dataStore.guests[idx].blacklisted };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Profile Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Store and manage guest information and preferences</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Guest
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Guest</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Nationality</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Stays</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Spent</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-700/40 transition-colors duration-150 border-l-2 ${guest.blacklisted ? 'border-l-red-400' : guest.vipStatus ? 'border-l-amber-400' : 'border-l-transparent'}`}>
                {/* Guest */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{guest.firstName} {guest.lastName}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500">{guest.id}</div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="text-gray-900 dark:text-white">{guest.email}</div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500">{guest.phone}</div>
                </td>

                {/* Nationality */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-gray-600 dark:text-gray-300">{guest.nationality || <span className="text-gray-300 dark:text-zinc-600">—</span>}</span>
                </td>

                {/* Stays */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-900 dark:text-white font-medium">{guest.totalStays}</span>
                </td>

                {/* Spent */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-900 dark:text-white font-medium">${guest.totalSpent.toLocaleString()}</span>
                </td>

                {/* Status badges + toggles */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleVip(guest.id)}
                      title={guest.vipStatus ? 'Remove VIP' : 'Mark as VIP'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors duration-150 ${guest.vipStatus ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700' : 'bg-transparent text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-amber-300 hover:text-amber-500'}`}
                    >
                      <Star className={`w-3 h-3 ${guest.vipStatus ? 'fill-current' : ''}`} /> VIP
                    </button>
                    <button
                      onClick={() => handleToggleBlacklist(guest.id)}
                      title={guest.blacklisted ? 'Remove from Blacklist' : 'Blacklist Guest'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors duration-150 ${guest.blacklisted ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700' : 'bg-transparent text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-red-300 hover:text-red-500'}`}
                    >
                      <Ban className="w-3 h-3" /> Ban
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setViewGuest(guest)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(guest)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredGuests.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-zinc-500">
            No guests found.
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add New Guest"
        submitText="Add Guest"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nationality</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              placeholder="e.g., American, British"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Type</label>
            <select
              value={formData.idType}
              onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="National ID">National ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Number</label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Issuing Country</label>
            <input
              type="text"
              value={formData.issuingCountry}
              onChange={(e) => setFormData({ ...formData, issuingCountry: e.target.value })}
              placeholder="e.g., USA, UK"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Document Image URL</label>
            <input
              type="text"
              value={formData.idDocumentImage}
              onChange={(e) => setFormData({ ...formData, idDocumentImage: e.target.value })}
              placeholder="https://example.com/id-image.jpg"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Preferences</label>
            <textarea
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              placeholder="Non-smoking, high floor, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Guest Flags</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-colors select-none ${formData.vipStatus ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-zinc-600 hover:border-amber-300'}`}>
                <input
                  type="checkbox"
                  checked={formData.vipStatus}
                  onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })}
                  className="sr-only"
                />
                <Star className={`w-4 h-4 ${formData.vipStatus ? 'text-amber-500 fill-current' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.vipStatus ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300'}`}>VIP Guest</span>
              </label>
              <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-colors select-none ${formData.blacklisted ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-zinc-600 hover:border-red-300'}`}>
                <input
                  type="checkbox"
                  checked={formData.blacklisted}
                  onChange={(e) => setFormData({ ...formData, blacklisted: e.target.checked })}
                  className="sr-only"
                />
                <Ban className={`w-4 h-4 ${formData.blacklisted ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.blacklisted ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>Blacklisted</span>
              </label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Edit Guest Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGuest(null);
        }}
        onSubmit={handleEditSubmit}
        title={`Edit Guest ${editingGuest?.id}`}
        submitText="Save Changes"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">First Name *</label>
            <input
              type="text"
              value={editData.firstName}
              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Last Name *</label>
            <input
              type="text"
              value={editData.lastName}
              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone *</label>
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date of Birth</label>
            <input
              type="date"
              value={editData.dateOfBirth}
              onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Gender</label>
            <select
              value={editData.gender}
              onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Address</label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nationality</label>
            <input
              type="text"
              value={editData.nationality}
              onChange={(e) => setEditData({ ...editData, nationality: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Type</label>
            <select
              value={editData.idType}
              onChange={(e) => setEditData({ ...editData, idType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="National ID">National ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Number</label>
            <input
              type="text"
              value={editData.idNumber}
              onChange={(e) => setEditData({ ...editData, idNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Issuing Country</label>
            <input
              type="text"
              value={editData.issuingCountry}
              onChange={(e) => setEditData({ ...editData, issuingCountry: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ID Document Image URL</label>
            <input
              type="text"
              value={editData.idDocumentImage}
              onChange={(e) => setEditData({ ...editData, idDocumentImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Preferences</label>
            <textarea
              value={editData.preferences}
              onChange={(e) => setEditData({ ...editData, preferences: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Guest Flags</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-colors select-none ${editData.vipStatus ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-zinc-600 hover:border-amber-300'}`}>
                <input
                  type="checkbox"
                  checked={editData.vipStatus}
                  onChange={(e) => setEditData({ ...editData, vipStatus: e.target.checked })}
                  className="sr-only"
                />
                <Star className={`w-4 h-4 ${editData.vipStatus ? 'text-amber-500 fill-current' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${editData.vipStatus ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300'}`}>VIP Guest</span>
              </label>
              <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-colors select-none ${editData.blacklisted ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-zinc-600 hover:border-red-300'}`}>
                <input
                  type="checkbox"
                  checked={editData.blacklisted}
                  onChange={(e) => setEditData({ ...editData, blacklisted: e.target.checked })}
                  className="sr-only"
                />
                <Ban className={`w-4 h-4 ${editData.blacklisted ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${editData.blacklisted ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>Blacklisted</span>
              </label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* View Guest Modal */}
      {viewGuest && (() => {
        // Calculate stay history
        const guestReservations = reservations.filter(r => r.guestId === viewGuest.id);
        const sortedReservations = [...guestReservations].sort((a, b) =>
          new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime()
        );

        const completedStays = guestReservations.filter(r => r.status === 'checked-out');
        const lastStayDate = completedStays.length > 0
          ? completedStays.sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())[0].checkOut
          : null;

        const currentReservations = guestReservations.filter(r =>
          r.status === 'checked-in' || r.status === 'confirmed'
        );
        const currentReservation = currentReservations.length > 0
          ? currentReservations[0].id
          : null;

        const reservationHistory = guestReservations.map(r => r.id).join(', ');

        return (
          <Modal
            isOpen={!!viewGuest}
            onClose={() => setViewGuest(null)}
            title={`${viewGuest.firstName} ${viewGuest.lastName}`}
            size="md"
          >
            <div className="space-y-6">
              {/* VIP / Blacklist Status */}
              {(viewGuest.vipStatus || viewGuest.blacklisted) && (
                <div className="flex gap-2 flex-wrap">
                  {viewGuest.vipStatus && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-current" /> VIP Guest
                    </span>
                  )}
                  {viewGuest.blacklisted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-900/40 dark:text-red-400">
                      <Ban className="w-4 h-4" /> Blacklisted
                    </span>
                  )}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Guest ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewGuest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewGuest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewGuest.phone}</p>
                </div>
                {viewGuest.dateOfBirth && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewGuest.dateOfBirth}</p>
                  </div>
                )}
                {viewGuest.gender && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Gender</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewGuest.gender}</p>
                  </div>
                )}
                {viewGuest.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewGuest.address}</p>
                  </div>
                )}
                {viewGuest.nationality && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Nationality</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewGuest.nationality}</p>
                  </div>
                )}
              </div>

              {/* Identification Information */}
              {(viewGuest.idType || viewGuest.idNumber || viewGuest.issuingCountry || viewGuest.idDocumentImage) && (
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Identification Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewGuest.idType && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">ID Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{viewGuest.idType}</p>
                      </div>
                    )}
                    {viewGuest.idNumber && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">ID Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">{viewGuest.idNumber}</p>
                      </div>
                    )}
                    {viewGuest.issuingCountry && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Issuing Country</p>
                        <p className="font-medium text-gray-900 dark:text-white">{viewGuest.issuingCountry}</p>
                      </div>
                    )}
                    {viewGuest.idDocumentImage && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">ID Document Image</p>
                        <img
                          src={viewGuest.idDocumentImage}
                          alt="ID Document"
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-zinc-600"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <p className="text-sm text-gray-500 dark:text-zinc-400 hidden">Image unavailable</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stay History */}
              <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Stay History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Stays</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{viewGuest.totalStays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Spent</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${viewGuest.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Last Stay Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {lastStayDate || <span className="text-gray-400 dark:text-zinc-500 italic">No completed stays</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Current Reservation</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentReservation || <span className="text-gray-400 dark:text-zinc-500 italic">None</span>}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Reservation History</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reservationHistory || <span className="text-gray-400 dark:text-zinc-500 italic">No reservations</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              {viewGuest.preferences && (
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Preferences</p>
                  <p className="text-gray-900 dark:text-white">{viewGuest.preferences}</p>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

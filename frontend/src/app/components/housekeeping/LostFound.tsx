import { useState } from 'react';
import { Plus, Package, Edit2, Trash2, Bell, X } from 'lucide-react';
import { dataStore } from '../../data/store';
import { LostFoundItem } from '../../types';
import FormModal from '../shared/FormModal';

export default function HousekeepingLostFound() {
  const [items, setItems] = useState(dataStore.getLostFoundItems());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    roomNumber: '',
    description: '',
    category: '',
    foundBy: '',
    storageLocation: '',
    claimContact: '',
    disposeAt: ''
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'unclaimed': 'bg-yellow-100 text-yellow-700',
      'claimed': 'bg-green-100 text-green-700',
      'returned': 'bg-blue-100 text-blue-700',
      'disposed': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Items whose disposeAt is within 7 days and still unclaimed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const notifications = items.filter(item => {
    if (item.status !== 'unclaimed' || !item.disposeAt) return false;
    if (dismissedNotifications.has(item.id)) return false;
    const disposeDate = new Date(item.disposeAt);
    disposeDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((disposeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  });

  const getDaysLeft = (disposeAt: string) => {
    const disposeDate = new Date(disposeAt);
    disposeDate.setHours(0, 0, 0, 0);
    return Math.ceil((disposeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = () => {
    const newItem: LostFoundItem = {
      id: `LF${String(items.length + 1).padStart(3, '0')}`,
      roomNumber: formData.roomNumber,
      description: formData.description,
      category: formData.category,
      foundDate: new Date().toISOString().split('T')[0],
      foundBy: formData.foundBy,
      status: 'unclaimed',
      storageLocation: formData.storageLocation || undefined,
      claimContact: formData.claimContact || undefined,
      disposeAt: formData.disposeAt || undefined
    };

    setItems([...items, newItem]);
    dataStore.lostFoundItems.push(newItem);
    setShowAddModal(false);
    setFormData({ roomNumber: '', description: '', category: '', foundBy: '', storageLocation: '', claimContact: '', disposeAt: '' });
  };

  const markAsClaimed = (itemId: string) => {
    const updatedItems = items.map(i =>
      i.id === itemId ? { ...i, status: 'claimed' as const, claimedDate: new Date().toISOString().split('T')[0] } : i
    );
    setItems(updatedItems);
    const idx = dataStore.lostFoundItems.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      dataStore.lostFoundItems[idx] = { ...dataStore.lostFoundItems[idx], status: 'claimed', claimedDate: new Date().toISOString().split('T')[0] };
    }
  };

  const handleEdit = (item: LostFoundItem) => {
    setEditingItem(item);
    setFormData({
      roomNumber: item.roomNumber,
      description: item.description,
      category: item.category,
      foundBy: item.foundBy,
      storageLocation: item.storageLocation || '',
      claimContact: item.claimContact || '',
      disposeAt: item.disposeAt || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;
    const updatedItems = items.map(i =>
      i.id === editingItem.id ? {
        ...i,
        roomNumber: formData.roomNumber,
        description: formData.description,
        category: formData.category,
        foundBy: formData.foundBy,
        storageLocation: formData.storageLocation || undefined,
        claimContact: formData.claimContact || undefined,
        disposeAt: formData.disposeAt || undefined
      } : i
    );
    setItems(updatedItems);
    const idx = dataStore.lostFoundItems.findIndex(i => i.id === editingItem.id);
    if (idx !== -1) {
      dataStore.lostFoundItems[idx] = {
        ...dataStore.lostFoundItems[idx],
        roomNumber: formData.roomNumber,
        description: formData.description,
        category: formData.category,
        foundBy: formData.foundBy,
        storageLocation: formData.storageLocation || undefined,
        claimContact: formData.claimContact || undefined,
        disposeAt: formData.disposeAt || undefined
      };
    }
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setItems(items.filter(i => i.id !== itemId));
    const idx = dataStore.lostFoundItems.findIndex(i => i.id === itemId);
    if (idx !== -1) dataStore.lostFoundItems.splice(idx, 1);
  };

  const sharedFormFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
          <input type="text" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            placeholder="e.g., 101" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
            <option value="">Select category...</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Documents">Documents</option>
            <option value="Personal Items">Personal Items</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the item found..." rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Found By *</label>
          <input type="text" value={formData.foundBy} onChange={(e) => setFormData({ ...formData, foundBy: e.target.value })}
            placeholder="Staff member name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
          <input type="text" value={formData.storageLocation} onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            placeholder="e.g., Front Desk - Drawer 3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Claim Contact</label>
          <input type="text" value={formData.claimContact} onChange={(e) => setFormData({ ...formData, claimContact: e.target.value })}
            placeholder="e.g., +1-555-0123 or email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">Contact info for the owner if known</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dispose After</label>
          <input type="date" value={formData.disposeAt} onChange={(e) => setFormData({ ...formData, disposeAt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">Date after which item may be disposed</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(item => {
            const days = getDaysLeft(item.disposeAt!);
            const isOverdue = days < 0;
            const isToday = days === 0;
            return (
              <div key={item.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                <p className="text-sm flex-1">
                  <span className="font-medium">{item.id} — {item.description}</span>
                  {isOverdue
                    ? ` is overdue for disposal by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}.`
                    : isToday
                    ? ' is scheduled for disposal today.'
                    : ` is scheduled for disposal in ${days} day${days !== 1 ? 's' : ''} (${item.disposeAt}).`}
                  {item.claimContact && <span className="ml-1">Owner contact: <span className="font-medium">{item.claimContact}</span>.</span>}
                </p>
                <button onClick={() => setDismissedNotifications(prev => new Set(prev).add(item.id))} className="shrink-0 text-current opacity-50 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-600 mt-1">Manage items found during room cleaning</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Unclaimed', count: items.filter(i => i.status === 'unclaimed').length, color: 'bg-yellow-500' },
          { label: 'Claimed', count: items.filter(i => i.status === 'claimed').length, color: 'bg-green-500' },
          { label: 'Returned', count: items.filter(i => i.status === 'returned').length, color: 'bg-blue-500' },
          { label: 'Total Items', count: items.length, color: 'bg-gray-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-3 rounded-lg`}><Package className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Item ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Room</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Found</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Storage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden xl:table-cell">Claim Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden xl:table-cell">Dispose After</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item) => {
              const isNearDisposal = item.disposeAt && item.status === 'unclaimed' && getDaysLeft(item.disposeAt) <= 7;
              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isNearDisposal ? 'bg-amber-50/40' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{item.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{item.roomNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[180px]">
                    <span className="line-clamp-2">{item.description}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{item.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                    <div>{item.foundDate}</div>
                    <div className="text-xs text-gray-400">{item.foundBy}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{item.storageLocation || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">{item.claimContact || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm hidden xl:table-cell">
                    {item.disposeAt ? (
                      <span className={`${item.status === 'unclaimed' && getDaysLeft(item.disposeAt) <= 3 ? 'text-red-600 font-medium' : item.status === 'unclaimed' && getDaysLeft(item.disposeAt) <= 7 ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                        {item.disposeAt}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {item.claimedBy && <div className="text-xs text-gray-500 mt-1">By: {item.claimedBy}</div>}
                    {item.claimedDate && <div className="text-xs text-gray-500">On: {item.claimedDate}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'unclaimed' && (
                        <button onClick={() => markAsClaimed(item.id)}
                          className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 border border-green-200 transition-colors whitespace-nowrap">
                          Mark Claimed
                        </button>
                      )}
                      <button onClick={() => handleEdit(item)}
                        className="p-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded border border-gray-300 hover:border-blue-300 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded border border-gray-300 hover:border-red-300 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">No items logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleSubmit}
        title="Add Lost & Found Item" submitText="Add Item" size="lg">
        {sharedFormFields}
      </FormModal>

      <FormModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingItem(null); }}
        onSubmit={handleEditSubmit} title="Edit Lost & Found Item" submitText="Update Item" size="lg">
        {sharedFormFields}
      </FormModal>
    </div>
  );
}

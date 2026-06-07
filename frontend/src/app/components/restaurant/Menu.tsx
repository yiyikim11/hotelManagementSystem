import { useState } from 'react';
import { Plus, Clock, AlertCircle, Edit2 } from 'lucide-react';
import { dataStore } from '../../data/store';
import { MenuItem } from '../../types';
import FormModal from '../shared/FormModal';

export default function RestaurantMenu() {
  const [menuItems, setMenuItems] = useState(dataStore.getMenuItems());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    weekendPrice: '',
    preparationTime: '',
    allergens: '',
    imageUrl: '',
    isAvailable: true
  });
  const [editData, setEditData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    weekendPrice: '',
    preparationTime: '',
    allergens: '',
    imageUrl: '',
    isAvailable: true
  });

  const categories = [...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item =>
    filterCategory === 'all' || item.category === filterCategory
  );

  const handleSubmit = () => {
    const newItem: MenuItem = {
      id: `M${String(menuItems.length + 1).padStart(3, '0')}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      weekendPrice: formData.weekendPrice ? parseFloat(formData.weekendPrice) : undefined,
      isAvailable: formData.isAvailable,
      preparationTime: parseInt(formData.preparationTime),
      allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : undefined,
      imageUrl: formData.imageUrl || undefined
    };

    setMenuItems([...menuItems, newItem]);
    dataStore.menuItems.push(newItem);
    setShowAddModal(false);
    setFormData({
      name: '',
      category: '',
      description: '',
      basePrice: '',
      weekendPrice: '',
      preparationTime: '',
      allergens: '',
      imageUrl: '',
      isAvailable: true
    });
  };

  const toggleAvailability = (itemId: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    setMenuItems(updatedItems);
    const itemIndex = dataStore.menuItems.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
      dataStore.menuItems[itemIndex].isAvailable = !dataStore.menuItems[itemIndex].isAvailable;
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditData({
      name: item.name,
      category: item.category,
      description: item.description,
      basePrice: item.basePrice.toString(),
      weekendPrice: item.weekendPrice?.toString() || '',
      preparationTime: item.preparationTime.toString(),
      allergens: item.allergens?.join(', ') || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;

    const updatedItem: MenuItem = {
      ...editingItem,
      name: editData.name,
      category: editData.category,
      description: editData.description,
      basePrice: parseFloat(editData.basePrice),
      weekendPrice: editData.weekendPrice ? parseFloat(editData.weekendPrice) : undefined,
      preparationTime: parseInt(editData.preparationTime),
      allergens: editData.allergens ? editData.allergens.split(',').map(a => a.trim()) : undefined,
      imageUrl: editData.imageUrl || undefined,
      isAvailable: editData.isAvailable
    };

    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id ? updatedItem : item
    );
    setMenuItems(updatedItems);

    const itemIndex = dataStore.menuItems.findIndex(i => i.id === editingItem.id);
    if (itemIndex !== -1) {
      dataStore.menuItems[itemIndex] = updatedItem;
    }

    setShowEditModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Create and manage menu items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Menu Item
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filterCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                <span className="text-gray-400 dark:text-zinc-500">No Image</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <div className={`w-3 h-3 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full mb-2">
                {item.category}
              </span>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Base Price:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">${item.basePrice}</span>
                </div>
                {item.weekendPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Weekend Price:</span>
                    <span className="text-lg font-bold text-orange-600">${item.weekendPrice}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{item.preparationTime} min prep time</span>
                </div>
              </div>

              {item.allergens && item.allergens.length > 0 && (
                <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800">Allergens:</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">{item.allergens.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    item.isAvailable
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:bg-red-900/40'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:bg-green-900/40'
                  }`}
                >
                  {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Menu Item Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add Menu Item"
        submitText="Add Item"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Grilled Salmon"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category...</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
              <option value="Salads">Salads</option>
              <option value="Soups">Soups</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh Atlantic salmon with seasonal vegetables"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Base Price ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="28.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Weekend Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.weekendPrice}
              onChange={(e) => setFormData({ ...formData, weekendPrice: e.target.value })}
              placeholder="32.00 (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Preparation Time (min) *</label>
            <input
              type="number"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              placeholder="25"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Allergens</label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              placeholder="Fish, Dairy (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Available Now</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Edit Menu Item Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
        title={`Edit Menu Item - ${editingItem?.name}`}
        submitText="Save Changes"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Item Name *</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Grilled Salmon"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category *</label>
            <select
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category...</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
              <option value="Salads">Salads</option>
              <option value="Soups">Soups</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description *</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Fresh Atlantic salmon with seasonal vegetables"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
            <input
              type="url"
              value={editData.imageUrl}
              onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Base Price ($) *</label>
            <input
              type="number"
              step="0.01"
              value={editData.basePrice}
              onChange={(e) => setEditData({ ...editData, basePrice: e.target.value })}
              placeholder="28.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Weekend Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={editData.weekendPrice}
              onChange={(e) => setEditData({ ...editData, weekendPrice: e.target.value })}
              placeholder="32.00 (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Preparation Time (min) *</label>
            <input
              type="number"
              value={editData.preparationTime}
              onChange={(e) => setEditData({ ...editData, preparationTime: e.target.value })}
              placeholder="25"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Allergens</label>
            <input
              type="text"
              value={editData.allergens}
              onChange={(e) => setEditData({ ...editData, allergens: e.target.value })}
              placeholder="Fish, Dairy (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editData.isAvailable}
                onChange={(e) => setEditData({ ...editData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Available Now</span>
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

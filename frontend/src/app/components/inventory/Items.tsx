import { useState } from 'react';
import { Plus, Search, AlertTriangle, Package, Edit2 } from 'lucide-react';
import { dataStore } from '../../data/store';
import { InventoryItem } from '../../types';
import FormModal from '../shared/FormModal';

export default function InventoryItems() {
  const [items, setItems] = useState(dataStore.getInventoryItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: '',
    minThreshold: '',
    unitCost: '',
    department: '',
    supplier: '',
    stockable: true
  });

  const categories = [...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);

  const handleSubmit = () => {
    const newItem: InventoryItem = {
      id: `INV${String(items.length + 1).padStart(3, '0')}`,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: parseInt(formData.quantity),
      minThreshold: parseInt(formData.minThreshold),
      unitCost: parseFloat(formData.unitCost),
      department: formData.department,
      supplier: formData.supplier || undefined,
      lastRestocked: new Date().toISOString().split('T')[0],
      stockable: formData.stockable
    };

    setItems([...items, newItem]);
    dataStore.inventoryItems.push(newItem);
    setShowAddModal(false);
    setFormData({
      name: '',
      category: '',
      unit: '',
      quantity: '',
      minThreshold: '',
      unitCost: '',
      department: '',
      supplier: '',
      stockable: true
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity.toString(),
      minThreshold: item.minThreshold.toString(),
      unitCost: item.unitCost.toString(),
      department: item.department,
      supplier: item.supplier || '',
      stockable: item.stockable
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: parseInt(formData.quantity),
      minThreshold: parseInt(formData.minThreshold),
      unitCost: parseFloat(formData.unitCost),
      department: formData.department,
      supplier: formData.supplier || undefined,
      stockable: formData.stockable
    };

    const updatedItems = items.map(item =>
      item.id === editingItem.id ? updatedItem : item
    );
    setItems(updatedItems);

    const itemIndex = dataStore.inventoryItems.findIndex(i => i.id === editingItem.id);
    if (itemIndex !== -1) {
      dataStore.inventoryItems[itemIndex] = updatedItem;
    }

    setShowEditModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      unit: '',
      quantity: '',
      minThreshold: '',
      unitCost: '',
      department: '',
      supplier: '',
      stockable: true
    });
  };

  const handleRestock = (item: InventoryItem) => {
    if (!item.stockable) {
      alert('This item is not stockable');
      return;
    }
    setRestockingItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestockSubmit = () => {
    if (!restockingItem || !restockQuantity) return;

    const quantity = parseInt(restockQuantity);
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const updatedItem: InventoryItem = {
      ...restockingItem,
      quantity: restockingItem.quantity + quantity,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    const updatedItems = items.map(item =>
      item.id === restockingItem.id ? updatedItem : item
    );
    setItems(updatedItems);

    const itemIndex = dataStore.inventoryItems.findIndex(i => i.id === restockingItem.id);
    if (itemIndex !== -1) {
      dataStore.inventoryItems[itemIndex] = updatedItem;
    }

    setShowRestockModal(false);
    setRestockingItem(null);
    setRestockQuantity('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Items</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage hotel inventory and stock items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{lowStockItems.length} items below minimum threshold</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span key={item.id} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Min Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Stockable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredItems.map((item) => {
              const isLowStock = item.quantity <= item.minThreshold;
              return (
                <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-800 ${isLowStock ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {item.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${isLowStock ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {item.minThreshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${item.unitCost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.stockable
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {item.stockable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-200"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestock(item)}
                        className={`${
                          item.stockable
                            ? 'text-green-600 hover:text-green-800 dark:text-green-200'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={item.stockable ? 'Restock' : 'Not stockable'}
                        disabled={!item.stockable}
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add Inventory Item"
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
              placeholder="Bath Towels"
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
              <option value="Linens">Linens</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Cleaning Supplies">Cleaning Supplies</option>
              <option value="Office Supplies">Office Supplies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Unit *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select unit...</option>
              <option value="pieces">Pieces</option>
              <option value="bottles">Bottles</option>
              <option value="boxes">Boxes</option>
              <option value="kg">Kilograms</option>
              <option value="liters">Liters</option>
              <option value="sets">Sets</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Initial Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Min Threshold *</label>
            <input
              type="number"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
              placeholder="200"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Unit Cost ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              placeholder="8.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select department...</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Front Office">Front Office</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Supplier</label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supplier...</option>
              {dataStore.getSuppliers().map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.stockable}
                onChange={(e) => setFormData({ ...formData, stockable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Stockable (Can be restocked)</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Edit Item Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
        title={`Edit Item - ${editingItem?.name}`}
        submitText="Update Item"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Bath Towels"
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
              <option value="Linens">Linens</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Cleaning Supplies">Cleaning Supplies</option>
              <option value="Office Supplies">Office Supplies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Unit *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select unit...</option>
              <option value="pieces">Pieces</option>
              <option value="bottles">Bottles</option>
              <option value="boxes">Boxes</option>
              <option value="kg">Kilograms</option>
              <option value="liters">Liters</option>
              <option value="sets">Sets</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Current Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Min Threshold *</label>
            <input
              type="number"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
              placeholder="200"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Unit Cost ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              placeholder="8.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select department...</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Front Office">Front Office</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Supplier</label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supplier...</option>
              {dataStore.getSuppliers().map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.stockable}
                onChange={(e) => setFormData({ ...formData, stockable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Stockable (Can be restocked)</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Restock Modal */}
      <FormModal
        isOpen={showRestockModal}
        onClose={() => {
          setShowRestockModal(false);
          setRestockingItem(null);
          setRestockQuantity('');
        }}
        onSubmit={handleRestockSubmit}
        title={`Restock - ${restockingItem?.name}`}
        submitText="Restock"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Current Quantity</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{restockingItem?.quantity} {restockingItem?.unit}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Min Threshold</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{restockingItem?.minThreshold} {restockingItem?.unit}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity to Add *</label>
            <input
              type="number"
              min="1"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          {restockQuantity && parseInt(restockQuantity) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">New Quantity</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(restockingItem?.quantity || 0) + parseInt(restockQuantity)} {restockingItem?.unit}
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}

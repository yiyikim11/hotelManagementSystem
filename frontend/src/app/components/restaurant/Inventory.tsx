import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, Edit2, X } from 'lucide-react';
import { dataStore } from '../../data/store';
import { RestaurantInventory } from '../../types';
import FormModal from '../shared/FormModal';

export default function RestaurantInventoryManagement() {
  const [inventory, setInventory] = useState(dataStore.getRestaurantInventory());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RestaurantInventory | null>(null);
  const [restockingItem, setRestockingItem] = useState<RestaurantInventory | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    unit: '',
    quantity: '',
    minThreshold: '',
    unitCost: ''
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      category: '',
      unit: '',
      quantity: '',
      minThreshold: '',
      unitCost: ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    const newItem: RestaurantInventory = {
      id: `RI${String(inventory.length + 1).padStart(3, '0')}`,
      itemName: formData.itemName,
      category: formData.category,
      unit: formData.unit,
      quantity: parseFloat(formData.quantity),
      minThreshold: parseFloat(formData.minThreshold),
      unitCost: parseFloat(formData.unitCost),
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    setInventory([...inventory, newItem]);
    dataStore.restaurantInventory.push(newItem);
    setShowAddModal(false);
    setFormData({
      itemName: '',
      category: '',
      unit: '',
      quantity: '',
      minThreshold: '',
      unitCost: ''
    });
  };

  const handleEdit = (item: RestaurantInventory) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity.toString(),
      minThreshold: item.minThreshold.toString(),
      unitCost: item.unitCost.toString()
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;

    const updatedInventory = inventory.map(item =>
      item.id === editingItem.id ? {
        ...item,
        itemName: formData.itemName,
        category: formData.category,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        minThreshold: parseFloat(formData.minThreshold),
        unitCost: parseFloat(formData.unitCost)
      } : item
    );
    setInventory(updatedInventory);

    const itemIndex = dataStore.restaurantInventory.findIndex(item => item.id === editingItem.id);
    if (itemIndex !== -1) {
      dataStore.restaurantInventory[itemIndex] = {
        ...dataStore.restaurantInventory[itemIndex],
        itemName: formData.itemName,
        category: formData.category,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        minThreshold: parseFloat(formData.minThreshold),
        unitCost: parseFloat(formData.unitCost)
      };
    }

    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleRestock = (item: RestaurantInventory) => {
    setRestockingItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestockSubmit = () => {
    if (!restockingItem || !restockQuantity) return;

    const quantity = parseFloat(restockQuantity);
    if (quantity <= 0 || isNaN(quantity)) {
      alert('Please enter a valid quantity');
      return;
    }

    const updatedInventory = inventory.map(item =>
      item.id === restockingItem.id ? {
        ...item,
        quantity: item.quantity + quantity,
        lastRestocked: new Date().toISOString().split('T')[0]
      } : item
    );
    setInventory(updatedInventory);

    const itemIndex = dataStore.restaurantInventory.findIndex(item => item.id === restockingItem.id);
    if (itemIndex !== -1) {
      dataStore.restaurantInventory[itemIndex].quantity += quantity;
      dataStore.restaurantInventory[itemIndex].lastRestocked = new Date().toISOString().split('T')[0];
    }

    setShowRestockModal(false);
    setRestockingItem(null);
    setRestockQuantity('');
  };

  const getStockStatus = (item: RestaurantInventory) => {
    if (item.quantity <= item.minThreshold) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Low Stock</span>;
    } else if (item.quantity <= item.minThreshold * 1.5) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Medium</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Inventory</h1>
          <p className="text-gray-600 mt-1">Track stock levels and manage inventory</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalInventoryValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(inventory.map(item => item.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
              <p className="text-sm text-red-700 mt-1">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum threshold
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    {item.itemName} ({item.quantity} {item.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Restocked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.itemName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.minThreshold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.unitCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${(item.quantity * item.unitCost).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.lastRestocked || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStockStatus(item)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestock(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Restock"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
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
      </div>

      {/* Add Item Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add Inventory Item"
        submitText="Add Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g., Fresh Salmon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category...</option>
                <option value="Seafood">Seafood</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Baking">Baking</option>
                <option value="Beverages">Beverages</option>
                <option value="Condiments">Condiments</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select unit...</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pieces">Pieces</option>
                <option value="packs">Packs</option>
                <option value="boxes">Boxes</option>
                <option value="bottles">Bottles</option>
                <option value="cans">Cans</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Threshold *</label>
              <input
                type="number"
                step="0.01"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
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
        title="Edit Inventory Item"
        submitText="Update Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g., Fresh Salmon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category...</option>
                <option value="Seafood">Seafood</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Baking">Baking</option>
                <option value="Beverages">Beverages</option>
                <option value="Condiments">Condiments</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select unit...</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pieces">Pieces</option>
                <option value="packs">Packs</option>
                <option value="boxes">Boxes</option>
                <option value="bottles">Bottles</option>
                <option value="cans">Cans</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Threshold *</label>
              <input
                type="number"
                step="0.01"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
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
        title={`Restock - ${restockingItem?.itemName}`}
        submitText="Restock"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Current Quantity</p>
                <p className="text-lg font-semibold text-gray-900">{restockingItem?.quantity} {restockingItem?.unit}</p>
              </div>
              <div>
                <p className="text-gray-500">Min Threshold</p>
                <p className="text-lg font-semibold text-gray-900">{restockingItem?.minThreshold} {restockingItem?.unit}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Add *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          {restockQuantity && parseFloat(restockQuantity) > 0 && !isNaN(parseFloat(restockQuantity)) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">New Quantity</p>
              <p className="text-2xl font-bold text-blue-600">
                {((restockingItem?.quantity || 0) + parseFloat(restockQuantity)).toFixed(2)} {restockingItem?.unit}
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}

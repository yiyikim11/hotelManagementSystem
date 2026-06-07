import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { dataStore } from '../../data/store';
import { StockMovement, InventoryItem } from '../../types';
import FormModal from '../shared/FormModal';

export default function InventoryStock() {
  const [movements, setMovements] = useState(dataStore.getStockMovements());
  const [items, setItems] = useState(dataStore.getInventoryItems());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [restockQuantity, setRestockQuantity] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    type: 'stock-in',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    performedBy: '',
    cost: '',
    reason: ''
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'stock-in': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'stock-out': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'transfer': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'damaged': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'adjustment': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    };
    return colors[type] || 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200';
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'stock-in': return TrendingUp;
      case 'stock-out': return TrendingDown;
      default: return Package;
    }
  };

  const stockIn = movements.filter(m => m.type === 'stock-in');
  const stockOut = movements.filter(m => m.type === 'stock-out');
  const damaged = movements.filter(m => m.type === 'damaged');

  const handleSubmit = () => {
    // Find item by name or create a placeholder ID
    const item = items.find(i => i.name.toLowerCase() === formData.itemName.toLowerCase());

    const newMovement: StockMovement = {
      id: `SM${String(movements.length + 1).padStart(3, '0')}`,
      itemId: item?.id || 'UNKNOWN',
      itemName: formData.itemName,
      type: formData.type as StockMovement['type'],
      quantity: parseInt(formData.quantity),
      date: new Date().toISOString(),
      performedBy: formData.performedBy,
      fromLocation: formData.fromLocation || undefined,
      toLocation: formData.toLocation || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      reason: formData.reason || undefined
    };

    setMovements([...movements, newMovement]);
    dataStore.stockMovements.push(newMovement);
    setShowAddModal(false);
    setFormData({
      itemName: '',
      type: 'stock-in',
      quantity: '',
      fromLocation: '',
      toLocation: '',
      performedBy: '',
      cost: '',
      reason: ''
    });
  };

  const handleRestockSubmit = () => {
    if (!selectedItemId || !restockQuantity || !performedBy) {
      alert('Please fill all required fields');
      return;
    }

    const quantity = parseInt(restockQuantity);
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (!item.stockable) {
      alert('This item is not stockable');
      return;
    }

    // Update item quantity
    const updatedItem = {
      ...item,
      quantity: item.quantity + quantity,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    const updatedItems = items.map(i => i.id === selectedItemId ? updatedItem : i);
    setItems(updatedItems);

    const itemIndex = dataStore.inventoryItems.findIndex(i => i.id === selectedItemId);
    if (itemIndex !== -1) {
      dataStore.inventoryItems[itemIndex] = updatedItem;
    }

    // Record stock movement
    const newMovement: StockMovement = {
      id: `SM${String(movements.length + 1).padStart(3, '0')}`,
      itemId: item.id,
      itemName: item.name,
      type: 'stock-in',
      quantity: quantity,
      date: new Date().toISOString(),
      performedBy: performedBy,
      reason: 'Restock'
    };

    setMovements([...movements, newMovement]);
    dataStore.stockMovements.push(newMovement);

    setShowRestockModal(false);
    setSelectedItemId('');
    setRestockQuantity('');
    setPerformedBy('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track inventory transactions and transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRestockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Package className="w-5 h-5" />
            Quick Restock
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Record Movement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Stock In</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stockIn.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Stock Out</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stockOut.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Damaged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{damaged.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Movement ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">From/To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Performed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {movements.map((movement) => {
              const TypeIcon = getTypeIcon(movement.type);
              return (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {movement.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movement.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(movement.type)}`}>
                        {movement.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {movement.type === 'stock-in' || movement.type === 'damaged' ? '+' : '-'}
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {movement.fromLocation && <div>From: {movement.fromLocation}</div>}
                    {movement.toLocation && <div>To: {movement.toLocation}</div>}
                    {!movement.fromLocation && !movement.toLocation && '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {movement.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(movement.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movement.cost ? `$${movement.cost}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {movement.reason || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Movement Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Record Stock Movement"
        submitText="Record"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Item *</label>
            <select
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select item...</option>
              {items.map(item => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Movement Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="stock-in">Stock In</option>
              <option value="stock-out">Stock Out</option>
              <option value="transfer">Transfer</option>
              <option value="damaged">Damaged</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">From Location</label>
            <input
              type="text"
              value={formData.fromLocation}
              onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
              placeholder="Origin location (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">To Location</label>
            <input
              type="text"
              value={formData.toLocation}
              onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
              placeholder="Destination location (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Performed By *</label>
            <input
              type="text"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
              placeholder="Staff member name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cost ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for movement (optional)"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Quick Restock Modal */}
      <FormModal
        isOpen={showRestockModal}
        onClose={() => {
          setShowRestockModal(false);
          setSelectedItemId('');
          setRestockQuantity('');
          setPerformedBy('');
        }}
        onSubmit={handleRestockSubmit}
        title="Quick Restock"
        submitText="Restock"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Item *</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose an item...</option>
              {items.filter(item => item.stockable).map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - Current: {item.quantity} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {selectedItemId && (() => {
            const item = items.find(i => i.id === selectedItemId);
            return item ? (
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Current Quantity</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.quantity} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Min Threshold</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.minThreshold} {item.unit}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Performed By *</label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="Staff member name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {selectedItemId && restockQuantity && parseInt(restockQuantity) > 0 && (() => {
            const item = items.find(i => i.id === selectedItemId);
            return item ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">New Quantity</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {item.quantity + parseInt(restockQuantity)} {item.unit}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      </FormModal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Star, Phone, Mail, MapPin, X, ShoppingCart } from 'lucide-react';
import { dataStore } from '../../data/store';
import { Supplier, InventoryItem, PurchaseRecord } from '../../types';
import FormModal from '../shared/FormModal';

export default function InventorySuppliers() {
  const [suppliers, setSuppliers] = useState(dataStore.getSuppliers());
  const [purchases, setPurchases] = useState(dataStore.getPurchaseRecords());
  const [inventoryItems] = useState(dataStore.getInventoryItems());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: [] as string[],
    paymentTerms: '',
    rating: ''
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [poItems, setPOItems] = useState<Array<{ itemId: string; quantity: string }>>([]);
  const [deliveryDate, setDeliveryDate] = useState('');

  const handleSubmit = () => {
    const newSupplier: Supplier = {
      id: `SUP${String(suppliers.length + 1).padStart(3, '0')}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      category: formData.category,
      paymentTerms: formData.paymentTerms,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      isActive: true
    };

    setSuppliers([...suppliers, newSupplier]);
    dataStore.suppliers.push(newSupplier);
    setShowAddModal(false);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      category: [],
      paymentTerms: '',
      rating: ''
    });
    setCategoryInput('');
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.category.includes(categoryInput.trim())) {
      setFormData({
        ...formData,
        category: [...formData.category, categoryInput.trim()]
      });
      setCategoryInput('');
    }
  };

  const removeCategory = (cat: string) => {
    setFormData({
      ...formData,
      category: formData.category.filter(c => c !== cat)
    });
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const handleCreatePO = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPOItems([{ itemId: '', quantity: '' }]);
    setDeliveryDate('');
    setShowPOModal(true);
  };

  const addPOItem = () => {
    setPOItems([...poItems, { itemId: '', quantity: '' }]);
  };

  const removePOItem = (index: number) => {
    setPOItems(poItems.filter((_, i) => i !== index));
  };

  const updatePOItem = (index: number, field: 'itemId' | 'quantity', value: string) => {
    const updated = [...poItems];
    updated[index][field] = value;
    setPOItems(updated);
  };

  const handlePOSubmit = () => {
    if (!selectedSupplier || poItems.length === 0 || !deliveryDate) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    const items = poItems.filter(item => item.itemId && item.quantity).map(item => {
      const invItem = inventoryItems.find(i => i.id === item.itemId);
      return {
        itemId: item.itemId,
        itemName: invItem?.name || 'Unknown',
        quantity: parseInt(item.quantity),
        unitCost: invItem?.unitCost || 0
      };
    });

    if (items.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    const newPO: PurchaseRecord = {
      id: `PO${String(purchases.length + 1).padStart(3, '0')}`,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      items: items,
      totalAmount: totalAmount,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate,
      status: 'ordered',
      paymentStatus: 'pending'
    };

    setPurchases([...purchases, newPO]);
    dataStore.purchaseRecords.push(newPO);
    setShowPOModal(false);
    setSelectedSupplier(null);
    setPOItems([]);
    setDeliveryDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage suppliers and purchase records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Suppliers</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{suppliers.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Active Suppliers</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {suppliers.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Purchases</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{purchases.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Purchase Value</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                  {supplier.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{supplier.rating}/5</span>
                    </div>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${supplier.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-600'}`} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{supplier.phone}</div>
                    <div className="text-gray-900 dark:text-white">{supplier.contactPerson}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{supplier.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-zinc-700 mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Categories:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.category.map((cat, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-zinc-700 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Payment Terms:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{supplier.paymentTerms}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(supplier)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleCreatePO(supplier)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Create PO
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Records */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Purchase Orders</h2>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">PO #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {purchase.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {purchase.supplierName}
                    {purchase.invoiceNumber && (
                      <div className="text-xs text-gray-500 dark:text-zinc-400">Invoice: {purchase.invoiceNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {purchase.orderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {purchase.deliveryDate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    ${purchase.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      purchase.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      purchase.status === 'ordered' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      purchase.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      purchase.paymentStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200'
                    }`}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Add New Supplier"
        submitText="Add Supplier"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Supplier Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Company Name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Contact Person *</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="John Doe"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@supplier.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, City, State, ZIP"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Categories *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="e.g., Food, Beverages"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:bg-zinc-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.category.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2">
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Payment Terms *</label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              placeholder="e.g., Net 30"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Rating (1-5)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              placeholder="4.5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* View Details Modal */}
      <FormModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSupplier(null);
        }}
        onSubmit={() => setShowDetailsModal(false)}
        title={`Supplier Details - ${selectedSupplier?.name}`}
        submitText="Close"
        size="md"
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{selectedSupplier.name}</h3>
                <div className={`w-3 h-3 rounded-full ${selectedSupplier.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              {selectedSupplier.rating && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-gray-900 dark:text-white font-medium">{selectedSupplier.rating}/5</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Contact Person</p>
                <p className="text-gray-900 dark:text-white">{selectedSupplier.contactPerson}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Phone</p>
                <p className="text-gray-900 dark:text-white">{selectedSupplier.phone}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Email</p>
                <p className="text-gray-900 dark:text-white">{selectedSupplier.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Address</p>
                <p className="text-gray-900 dark:text-white">{selectedSupplier.address}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.category.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Payment Terms</p>
                <p className="text-gray-900 dark:text-white">{selectedSupplier.paymentTerms}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Total Purchase Orders</p>
                <p className="text-gray-900 dark:text-white">
                  {purchases.filter(p => p.supplierId === selectedSupplier.id).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Create PO Modal */}
      <FormModal
        isOpen={showPOModal}
        onClose={() => {
          setShowPOModal(false);
          setSelectedSupplier(null);
          setPOItems([]);
          setDeliveryDate('');
        }}
        onSubmit={handlePOSubmit}
        title={`Create Purchase Order - ${selectedSupplier?.name}`}
        submitText="Create PO"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">New Purchase Order</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Supplier: {selectedSupplier?.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Expected Delivery Date *</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Items *</label>
            <div className="space-y-2">
              {poItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={item.itemId}
                    onChange={(e) => updatePOItem(index, 'itemId', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select item...</option>
                    {inventoryItems.map(invItem => (
                      <option key={invItem.id} value={invItem.id}>
                        {invItem.name} - ${invItem.unitCost}/{invItem.unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updatePOItem(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-24 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {poItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePOItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPOItem}
              className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
            >
              + Add Item
            </button>
          </div>

          {poItems.some(item => item.itemId && item.quantity) && (
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                {poItems.filter(item => item.itemId && item.quantity).map((item, index) => {
                  const invItem = inventoryItems.find(i => i.id === item.itemId);
                  const total = invItem ? parseInt(item.quantity) * invItem.unitCost : 0;
                  return (
                    <div key={index} className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>{invItem?.name} x {item.quantity}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total Amount</span>
                  <span>
                    ${poItems.filter(item => item.itemId && item.quantity).reduce((sum, item) => {
                      const invItem = inventoryItems.find(i => i.id === item.itemId);
                      return sum + (invItem ? parseInt(item.quantity) * invItem.unitCost : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}

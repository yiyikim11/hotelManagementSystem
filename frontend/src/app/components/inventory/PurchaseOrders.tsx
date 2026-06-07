import { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, ShoppingCart, Truck, CheckCircle, Clock, XCircle, Edit2 } from 'lucide-react';
import FormModal from '../shared/FormModal';

interface POItem {
  id: string;
  itemName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  deliveredDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  items: POItem[];
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Truck },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700', icon: ShoppingCart },
  received: { label: 'Received', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const MOCK_SUPPLIERS = ['CleanTech Supplies', 'Premier Linens Co.', 'FoodMart Wholesale', 'Office World', 'Maintenance Pro'];
const MOCK_ITEMS = ['Bath Towels', 'Hand Soap', 'Shampoo (500ml)', 'Bed Sheets (King)', 'Pillowcases', 'Coffee Pods', 'Cleaning Solution', 'Printer Paper'];

const initialPOs: PurchaseOrder[] = [
  {
    id: 'PO001', poNumber: 'PO-2026-001', supplierName: 'CleanTech Supplies',
    status: 'received', orderDate: '2026-05-01', expectedDeliveryDate: '2026-05-10', deliveredDate: '2026-05-09',
    subtotal: 1800, taxAmount: 180, totalAmount: 1980, currency: 'USD', notes: 'Monthly housekeeping replenishment',
    items: [
      { id: 'POI001', itemName: 'Bath Towels', sku: 'SKU-001', quantityOrdered: 200, quantityReceived: 200, unitCost: 8, lineTotal: 1600 },
      { id: 'POI002', itemName: 'Hand Soap', sku: 'SKU-002', quantityOrdered: 100, quantityReceived: 100, unitCost: 2, lineTotal: 200 },
    ],
  },
  {
    id: 'PO002', poNumber: 'PO-2026-002', supplierName: 'Premier Linens Co.',
    status: 'partial', orderDate: '2026-05-15', expectedDeliveryDate: '2026-05-25',
    subtotal: 4500, taxAmount: 450, totalAmount: 4950, currency: 'USD',
    items: [
      { id: 'POI003', itemName: 'Bed Sheets (King)', sku: 'SKU-010', quantityOrdered: 100, quantityReceived: 60, unitCost: 35, lineTotal: 3500 },
      { id: 'POI004', itemName: 'Pillowcases', sku: 'SKU-011', quantityOrdered: 200, quantityReceived: 200, unitCost: 5, lineTotal: 1000 },
    ],
  },
  {
    id: 'PO003', poNumber: 'PO-2026-003', supplierName: 'FoodMart Wholesale',
    status: 'sent', orderDate: '2026-05-28', expectedDeliveryDate: '2026-06-05',
    subtotal: 2200, taxAmount: 220, totalAmount: 2420, currency: 'USD', notes: 'Restaurant kitchen stock',
    items: [
      { id: 'POI005', itemName: 'Coffee Pods', sku: 'SKU-020', quantityOrdered: 500, quantityReceived: 0, unitCost: 0.8, lineTotal: 400 },
      { id: 'POI006', itemName: 'Cleaning Solution', sku: 'SKU-021', quantityOrdered: 50, quantityReceived: 0, unitCost: 36, lineTotal: 1800 },
    ],
  },
  {
    id: 'PO004', poNumber: 'PO-2026-004', supplierName: 'Office World',
    status: 'draft', orderDate: '2026-06-01', expectedDeliveryDate: '2026-06-15',
    subtotal: 850, taxAmount: 85, totalAmount: 935, currency: 'USD',
    items: [
      { id: 'POI007', itemName: 'Printer Paper', sku: 'SKU-030', quantityOrdered: 100, quantityReceived: 0, unitCost: 8.5, lineTotal: 850 },
    ],
  },
];

export default function PurchaseOrders() {
  const [pos, setPOs] = useState<PurchaseOrder[]>(initialPOs);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [poItems, setPOItems] = useState<Array<{ itemName: string; sku: string; qty: string; unitCost: string }>>([
    { itemName: '', sku: '', qty: '', unitCost: '' },
  ]);
  const [form, setForm] = useState({
    supplierName: '', orderDate: '', expectedDeliveryDate: '', notes: '', currency: 'USD',
  });

  const filtered = pos.filter(po => {
    const matchesSearch = !searchTerm ||
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingPO(null);
    setForm({ supplierName: '', orderDate: '', expectedDeliveryDate: '', notes: '', currency: 'USD' });
    setPOItems([{ itemName: '', sku: '', qty: '', unitCost: '' }]);
    setShowModal(true);
  };

  const addPOItem = () => setPOItems([...poItems, { itemName: '', sku: '', qty: '', unitCost: '' }]);
  const removePOItem = (idx: number) => setPOItems(poItems.filter((_, i) => i !== idx));
  const updatePOItem = (idx: number, field: string, value: string) => {
    setPOItems(poItems.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = () => {
    const items: POItem[] = poItems
      .filter(i => i.itemName && i.qty && i.unitCost)
      .map((i, idx) => ({
        id: `POI${Date.now()}${idx}`,
        itemName: i.itemName,
        sku: i.sku || `SKU-${Date.now()}${idx}`,
        quantityOrdered: parseFloat(i.qty),
        quantityReceived: 0,
        unitCost: parseFloat(i.unitCost),
        lineTotal: parseFloat(i.qty) * parseFloat(i.unitCost),
      }));
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const taxAmount = subtotal * 0.1;
    const newPO: PurchaseOrder = {
      id: `PO${String(pos.length + 1).padStart(3, '0')}`,
      poNumber: `PO-2026-${String(pos.length + 1).padStart(3, '0')}`,
      supplierName: form.supplierName,
      status: 'draft',
      orderDate: form.orderDate,
      expectedDeliveryDate: form.expectedDeliveryDate,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      currency: form.currency,
      notes: form.notes || undefined,
      items,
    };
    setPOs([...pos, newPO]);
    setShowModal(false);
  };

  const handleStatusChange = (id: string, status: PurchaseOrder['status']) => {
    setPOs(pos.map(po => po.id === id ? { ...po, status, deliveredDate: status === 'received' ? new Date().toISOString().split('T')[0] : po.deliveredDate } : po));
  };

  const totalValue = pos.reduce((s, po) => s + po.totalAmount, 0);
  const pendingCount = pos.filter(po => ['draft', 'sent', 'partial'].includes(po.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Create and track supplier purchase orders</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New PO
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Pending / In Progress</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{pos.filter(po => po.status === 'received').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search PO number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* PO List */}
      <div className="space-y-3">
        {filtered.map((po) => {
          const cfg = STATUS_CONFIG[po.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={po.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-4 px-6 py-4">
                <button
                  onClick={() => setExpandedPO(expandedPO === po.id ? null : po.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedPO === po.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-semibold text-gray-900">{po.poNumber}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {po.supplierName} · Ordered {po.orderDate} · Expected {po.expectedDeliveryDate}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-gray-900">${po.totalAmount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{po.items.length} line item{po.items.length !== 1 ? 's' : ''}</div>
                </div>
                <select
                  value={po.status}
                  onChange={(e) => handleStatusChange(po.id, e.target.value as PurchaseOrder['status'])}
                  className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                    <option key={key} value={key}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              {expandedPO === po.id && (
                <div className="border-t border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ordered</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {po.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-2.5 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-6 py-2.5 text-xs font-mono text-gray-500">{item.sku}</td>
                          <td className="px-6 py-2.5 text-sm text-gray-700">{item.quantityOrdered}</td>
                          <td className="px-6 py-2.5 text-sm">
                            <span className={item.quantityReceived >= item.quantityOrdered ? 'text-green-600 font-medium' : item.quantityReceived > 0 ? 'text-yellow-600' : 'text-gray-400'}>
                              {item.quantityReceived}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-sm text-gray-700">${item.unitCost.toFixed(2)}</td>
                          <td className="px-6 py-2.5 text-sm font-semibold text-gray-900">${item.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={5} className="px-6 py-2 text-right text-sm text-gray-500">Subtotal</td>
                        <td className="px-6 py-2 text-sm font-semibold text-gray-900">${po.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-2 text-right text-sm text-gray-500">Tax (10%)</td>
                        <td className="px-6 py-2 text-sm text-gray-700">${po.taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-2 text-right text-sm font-semibold text-gray-900">Total</td>
                        <td className="px-6 py-2 text-sm font-bold text-gray-900">${po.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  {po.notes && (
                    <div className="px-6 py-3 bg-blue-50 text-sm text-blue-700 border-t border-blue-100">
                      Note: {po.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow text-center py-16 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No purchase orders found</p>
          </div>
        )}
      </div>

      {/* Add PO Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="New Purchase Order"
        submitText="Create PO"
        size="xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
              <select
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select supplier...</option>
                {MOCK_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery *</label>
              <input
                type="date"
                value={form.expectedDeliveryDate}
                onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button type="button" onClick={addPOItem} className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {poItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <select
                      value={item.itemName}
                      onChange={(e) => updatePOItem(idx, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select item...</option>
                      {MOCK_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.sku}
                      onChange={(e) => updatePOItem(idx, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updatePOItem(idx, 'qty', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updatePOItem(idx, 'unitCost', e.target.value)}
                      placeholder="Unit cost"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {poItems.length > 1 && (
                      <button type="button" onClick={() => removePOItem(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {poItems.some(i => i.qty && i.unitCost) && (
              <div className="mt-2 text-right text-sm font-semibold text-gray-700">
                Subtotal: ${poItems.reduce((s, i) => s + ((parseFloat(i.qty) || 0) * (parseFloat(i.unitCost) || 0)), 0).toFixed(2)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Additional instructions or remarks..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { dataStore } from '../../data/store';

export default function InventoryReports() {
  const items = dataStore.getInventoryItems();
  const movements = dataStore.getStockMovements();
  const purchases = dataStore.getPurchaseRecords();

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);

  const categoryData = Object.entries(
    items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.quantity * item.unitCost);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const departmentData = Object.entries(
    items.reduce((acc, item) => {
      acc[item.department] = (acc[item.department] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const movementTrend = [
    { month: 'Jan', 'Stock In': 150, 'Stock Out': 120 },
    { month: 'Feb', 'Stock In': 180, 'Stock Out': 140 },
    { month: 'Mar', 'Stock In': 200, 'Stock Out': 160 },
    { month: 'Apr', 'Stock In': 170, 'Stock Out': 150 },
    { month: 'May', 'Stock In': movements.filter(m => m.type === 'stock-in').length * 50, 'Stock Out': movements.filter(m => m.type === 'stock-out').length * 45 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Analytics and insights for inventory management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{items.length}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Across all departments</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{lowStockItems.length}</p>
          <p className="text-xs text-orange-600 mt-1">Needs attention</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Purchases (MTD)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Movement Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Stock In" fill="#10b981" />
              <Bar dataKey="Stock Out" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Value by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" name="Items" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase Summaries</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Purchases (MTD)</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{purchases.length} orders</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average Order Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${purchases.length > 0 ? (purchases.reduce((sum, p) => sum + p.totalAmount, 0) / purchases.length).toFixed(2) : 0}
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Per purchase</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Suppliers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(purchases.map(p => p.supplierId)).size}
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">This month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items Requiring Restock</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Min Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Suggested Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {lowStockItems.map((item) => {
                const suggestedOrder = (item.minThreshold * 2) - item.quantity;
                const estimatedCost = suggestedOrder * item.unitCost;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {suggestedOrder} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${estimatedCost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Valuation by Category</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Avg Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">% of Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {categoryData.map((cat) => {
                const categoryItems = items.filter(i => i.category === cat.name);
                const totalQuantity = categoryItems.reduce((sum, i) => sum + i.quantity, 0);
                const avgUnitCost = categoryItems.length > 0 ? categoryItems.reduce((sum, i) => sum + i.unitCost, 0) / categoryItems.length : 0;
                const percentOfTotal = (cat.value / totalValue) * 100;
                return (
                  <tr key={cat.name} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {categoryItems.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${cat.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      ${avgUnitCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {percentOfTotal.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 dark:bg-zinc-700/40 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{items.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${totalValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Stock Movement History</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">From/To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Performed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {movements.slice(0, 10).reverse().map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(movement.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {movement.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      movement.type === 'stock-in' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      movement.type === 'stock-out' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      movement.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      movement.type === 'damaged' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {movement.type === 'stock-in' ? '+' : '-'}{movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {movement.fromLocation && <div>From: {movement.fromLocation}</div>}
                    {movement.toLocation && <div>To: {movement.toLocation}</div>}
                    {!movement.fromLocation && !movement.toLocation && '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {movement.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movement.cost ? `$${movement.cost}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Summary */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Purchase Orders</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {purchases.slice(0, 10).map((purchase) => {
                const supplier = dataStore.getSuppliers().find(s => s.id === purchase.supplierId);
                return (
                  <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {purchase.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {supplier?.name || purchase.supplierId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {purchase.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {purchase.deliveryDate || 'Pending'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        purchase.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        purchase.status === 'ordered' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        purchase.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${purchase.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Usage Insights */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Usage Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Top 5 Most Used Items</h3>
            <div className="space-y-2">
              {movements
                .reduce((acc, m) => {
                  if (m.type === 'stock-out') {
                    const existing = acc.find(i => i.name === m.itemName);
                    if (existing) {
                      existing.count += m.quantity;
                    } else {
                      acc.push({ name: m.itemName, count: m.quantity });
                    }
                  }
                  return acc;
                }, [] as { name: string; count: number }[])
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                    <span className="text-sm font-semibold text-blue-600">{item.count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Fastest Moving Categories</h3>
            <div className="space-y-2">
              {Object.entries(
                movements
                  .filter(m => m.type === 'stock-out')
                  .reduce((acc, m) => {
                    const item = items.find(i => i.name === m.itemName);
                    if (item) {
                      acc[item.category] = (acc[item.category] || 0) + m.quantity;
                    }
                    return acc;
                  }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{category}</span>
                    <span className="text-sm font-semibold text-green-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Reorder Recommendations</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Critical Priority</span>
                <span className="text-sm font-semibold text-red-600">
                  {items.filter(i => i.quantity < i.minThreshold * 0.5).length} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">High Priority</span>
                <span className="text-sm font-semibold text-orange-600">
                  {items.filter(i => i.quantity >= i.minThreshold * 0.5 && i.quantity <= i.minThreshold).length} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Medium Priority</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {items.filter(i => i.quantity > i.minThreshold && i.quantity <= i.minThreshold * 1.5).length} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Estimated Restock Cost</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${lowStockItems.reduce((sum, item) => {
                    const suggestedOrder = (item.minThreshold * 2) - item.quantity;
                    return sum + (suggestedOrder * item.unitCost);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

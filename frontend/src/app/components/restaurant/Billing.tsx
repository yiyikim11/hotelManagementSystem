import { useState } from 'react';
import { DollarSign, CreditCard, Banknote } from 'lucide-react';
import { dataStore } from '../../data/store';

export default function RestaurantBilling() {
  const [orders, setOrders] = useState(dataStore.getRestaurantOrders());

  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending');
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount + o.taxAmount + o.serviceCharge - (o.discountAmount || 0), 0);

  const handlePayment = (orderId: string, method: 'card' | 'cash') => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, paymentStatus: 'paid' as const } : o
    );
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex].paymentStatus = 'paid';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 ">Billing & Payments</h1>
        <p className="text-gray-600  mt-1">Generate bills and process payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 ">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 ">{pendingPayments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Card Payments</p>
              <p className="text-2xl font-bold text-gray-900 ">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Avg Bill Amount</p>
              <p className="text-2xl font-bold text-gray-900 ">
                ${orders.length > 0 ? (totalRevenue / orders.filter(o => o.paymentStatus === 'paid').length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900  mb-4">Pending Payments</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingPayments.map((order) => (
            <div key={order.id} className="bg-white  rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 ">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600 ">
                    {order.type === 'dine-in' ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100  text-yellow-700  text-xs rounded-full">
                  Pending Payment
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {order.items.map((item, idx) => {
                  const modifiersTotal = item.modifiers
                    ? item.modifiers.reduce((sum, mod) => sum + (mod.price * item.quantity), 0)
                    : 0;
                  const itemTotal = (item.quantity * item.unitPrice) + modifiersTotal;

                  return (
                    <div key={idx} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">
                          {item.quantity}x {item.menuItemName}
                        </span>
                        <span className="text-gray-600">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="ml-4 mt-1 space-y-0.5">
                          {item.modifiers.map((mod, modIdx) => (
                            <div key={modIdx} className="flex justify-between text-xs text-gray-600">
                              <span>+ {mod.modifierName}</span>
                              <span>{mod.price > 0 ? `+$${(mod.price * item.quantity).toFixed(2)}` : 'Free'}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs text-gray-700 font-medium pt-1 border-t border-gray-100">
                            <span>Item Total:</span>
                            <span>${itemTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200  space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Subtotal:</span>
                  <span className="text-gray-900 ">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Tax (10%):</span>
                  <span className="text-gray-900 ">${order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Service Charge (10%):</span>
                  <span className="text-gray-900 ">${order.serviceCharge.toFixed(2)}</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 ">
                  <span className="text-gray-900 ">Total:</span>
                  <span className="text-gray-900 ">
                    ${Math.max(0, order.totalAmount + order.taxAmount + order.serviceCharge - (order.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => handlePayment(order.id, 'card')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
                <button
                  onClick={() => handlePayment(order.id, 'cash')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Banknote className="w-4 h-4" />
                  Cash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900  mb-4">Payment History</h2>
        <div className="bg-white  rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50  border-b border-gray-200 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Subtotal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Tax</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {orders.filter(o => o.paymentStatus === 'paid').map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 ">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600  capitalize">
                    {order.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                    {order.type === 'dine-in' ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 ">
                    ${order.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 ">
                    ${order.serviceCharge.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {order.discountAmount && order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 ">
                    ${Math.max(0, order.totalAmount + order.taxAmount + order.serviceCharge - (order.discountAmount || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100  text-green-700  text-xs rounded-full">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 ">
                    {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

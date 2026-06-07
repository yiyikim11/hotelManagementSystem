import { useState } from 'react';
import { Plus, Clock, CheckCircle2, UtensilsCrossed, Edit2, X, CreditCard, DollarSign } from 'lucide-react';
import { dataStore } from '../../data/store';
import { RestaurantOrder, OrderItem, OrderModifier } from '../../types';
import FormModal from '../shared/FormModal';

export default function RestaurantOrders() {
  const [orders, setOrders] = useState(dataStore.getRestaurantOrders());
  const [menuItems] = useState(dataStore.getMenuItems());
  const [modifiers] = useState(dataStore.getModifiers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RestaurantOrder | null>(null);
  const [formData, setFormData] = useState({
    type: 'dine-in',
    tableNumber: '',
    roomNumber: '',
    items: [] as { menuItemId: string; quantity: number; modifiers: string[] }[],
    notes: '',
    discountAmount: '0'
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'preparing': 'bg-blue-100 text-blue-700',
      'ready': 'bg-green-100 text-green-700',
      'served': 'bg-purple-100 text-purple-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready', 'served'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const updateOrderStatus = (orderId: string, newStatus: RestaurantOrder['status']) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        if (newStatus === 'completed') {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }
      return o;
    });
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex].status = newStatus;
      if (newStatus === 'completed') {
        dataStore.restaurantOrders[orderIndex].completedAt = new Date().toISOString();
      }
    }
  };

  const handlePayment = (orderId: string, paymentMethod: 'cash' | 'card') => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'completed' as const,
          paymentStatus: 'paid' as const,
          paymentMethod,
          completedAt: new Date().toISOString()
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex].status = 'completed';
      dataStore.restaurantOrders[orderIndex].paymentStatus = 'paid';
      dataStore.restaurantOrders[orderIndex].paymentMethod = paymentMethod;
      dataStore.restaurantOrders[orderIndex].completedAt = new Date().toISOString();
    }
  };

  const handleRoomCharge = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.roomNumber) return;

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'completed' as const,
          paymentStatus: 'paid' as const,
          paymentMethod: 'room_charge' as const,
          completedAt: new Date().toISOString()
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex].status = 'completed';
      dataStore.restaurantOrders[orderIndex].paymentStatus = 'paid';
      dataStore.restaurantOrders[orderIndex].paymentMethod = 'room_charge';
      dataStore.restaurantOrders[orderIndex].completedAt = new Date().toISOString();
    }
  };

  const addItemToOrder = () => {
    if (!selectedMenuItem || !selectedQuantity) return;

    const menuItem = menuItems.find(m => m.id === selectedMenuItem);
    if (!menuItem) return;

    setFormData({
      ...formData,
      items: [...formData.items, {
        menuItemId: selectedMenuItem,
        quantity: parseInt(selectedQuantity),
        modifiers: selectedModifiers
      }]
    });
    setSelectedMenuItem('');
    setSelectedQuantity('1');
    setSelectedModifiers([]);
  };

  const toggleModifier = (modifierId: string) => {
    setSelectedModifiers(prev =>
      prev.includes(modifierId)
        ? prev.filter(id => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  const getAvailableModifiers = (menuItemId: string) => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem || !menuItem.availableModifierIds) return [];

    return modifiers.filter(mod =>
      menuItem.availableModifierIds?.includes(mod.id) && mod.isActive
    );
  };

  const removeItemFromOrder = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (formData.items.length === 0) return;

    const orderItems: OrderItem[] = formData.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)!;
      const itemModifiers: OrderModifier[] = item.modifiers.map(modId => {
        const modifier = modifiers.find(m => m.id === modId)!;
        return {
          modifierId: modifier.id,
          modifierName: modifier.name,
          price: modifier.price
        };
      });

      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.basePrice,
        modifiers: itemModifiers.length > 0 ? itemModifiers : undefined
      };
    });

    const subtotal = orderItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const modifiersTotal = item.modifiers
        ? item.modifiers.reduce((modSum, mod) => modSum + (mod.price * item.quantity), 0)
        : 0;
      return sum + itemTotal + modifiersTotal;
    }, 0);
    const tax = subtotal * 0.10;
    const service = subtotal * 0.10;
    const discount = Math.max(0, parseFloat(formData.discountAmount) || 0);

    const newOrder: RestaurantOrder = {
      id: `RO${String(orders.length + 1).padStart(3, '0')}`,
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      type: formData.type as RestaurantOrder['type'],
      tableNumber: formData.type === 'dine-in' ? formData.tableNumber : undefined,
      roomNumber: formData.type === 'room-service' ? formData.roomNumber : undefined,
      items: orderItems,
      status: 'pending',
      totalAmount: subtotal,
      taxAmount: tax,
      serviceCharge: service,
      discountAmount: discount > 0 ? discount : undefined,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      notes: formData.notes || undefined
    };

    setOrders([...orders, newOrder]);
    dataStore.restaurantOrders.push(newOrder);
    setShowAddModal(false);
    setFormData({
      type: 'dine-in',
      tableNumber: '',
      roomNumber: '',
      items: [],
      notes: '',
      discountAmount: '0'
    });
    setSelectedModifiers([]);
  };

  const handleEdit = (order: RestaurantOrder) => {
    setEditingOrder(order);
    setFormData({
      type: order.type,
      tableNumber: order.tableNumber || '',
      roomNumber: order.roomNumber || '',
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        modifiers: item.modifiers?.map(m => m.modifierId) || []
      })),
      notes: order.notes || '',
      discountAmount: order.discountAmount ? String(order.discountAmount) : '0'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingOrder || formData.items.length === 0) return;

    const orderItems: OrderItem[] = formData.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)!;
      const itemModifiers: OrderModifier[] = item.modifiers.map(modId => {
        const modifier = modifiers.find(m => m.id === modId)!;
        return {
          modifierId: modifier.id,
          modifierName: modifier.name,
          price: modifier.price
        };
      });

      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.basePrice,
        modifiers: itemModifiers.length > 0 ? itemModifiers : undefined
      };
    });

    const subtotal = orderItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const modifiersTotal = item.modifiers
        ? item.modifiers.reduce((modSum, mod) => modSum + (mod.price * item.quantity), 0)
        : 0;
      return sum + itemTotal + modifiersTotal;
    }, 0);
    const tax = subtotal * 0.10;
    const service = subtotal * 0.10;
    const discount = Math.max(0, parseFloat(formData.discountAmount) || 0);

    const updatedOrders = orders.map(o =>
      o.id === editingOrder.id ? {
        ...o,
        type: formData.type as RestaurantOrder['type'],
        tableNumber: formData.type === 'dine-in' ? formData.tableNumber : undefined,
        roomNumber: formData.type === 'room-service' ? formData.roomNumber : undefined,
        items: orderItems,
        totalAmount: subtotal,
        taxAmount: tax,
        serviceCharge: service,
        discountAmount: discount > 0 ? discount : undefined,
        notes: formData.notes || undefined
      } : o
    );
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === editingOrder.id);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex] = {
        ...dataStore.restaurantOrders[orderIndex],
        type: formData.type as RestaurantOrder['type'],
        tableNumber: formData.type === 'dine-in' ? formData.tableNumber : undefined,
        roomNumber: formData.type === 'room-service' ? formData.roomNumber : undefined,
        items: orderItems,
        totalAmount: subtotal,
        taxAmount: tax,
        serviceCharge: service,
        discountAmount: discount > 0 ? discount : undefined,
        notes: formData.notes || undefined
      };
    }

    setShowEditModal(false);
    setEditingOrder(null);
    setFormData({
      type: 'dine-in',
      tableNumber: '',
      roomNumber: '',
      items: [],
      notes: ''
    });
    setSelectedModifiers([]);
  };

  const handleCancel = (orderId: string) => {
    const cancelledBy = prompt('Enter staff name who is cancelling this order:');
    if (!cancelledBy) return;

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled' as const,
          cancelledBy,
          cancelledAt: new Date().toISOString()
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    const orderIndex = dataStore.restaurantOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      dataStore.restaurantOrders[orderIndex] = {
        ...dataStore.restaurantOrders[orderIndex],
        status: 'cancelled',
        cancelledBy,
        cancelledAt: new Date().toISOString()
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Restaurant Orders</h1>
          <p className="text-gray-600  mt-1">Manage dine-in and room service orders</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2.5 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2.5 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Preparing</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'preparing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'ready').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2.5 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Served</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'served').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-3">
            <div className="bg-gray-500 p-2.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900  mb-4">Active Orders</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${order.status === 'served' ? 'border-2 border-orange-400' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {order.type === 'dine-in' ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'served' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                      Awaiting Payment
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
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
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {item.modifiers.map((mod, modIdx) => (
                            <div key={modIdx} className="flex justify-between text-xs text-gray-600">
                              <span>+ {mod.modifierName}</span>
                              <span>{mod.price > 0 ? `+$${(mod.price * item.quantity).toFixed(2)}` : 'Free'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex justify-between text-xs text-gray-700 font-medium mt-1 pt-1 border-t border-gray-100">
                          <span>Item Total:</span>
                          <span>${itemTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {order.notes && (
                <div className="mb-4 p-2 bg-yellow-50  border border-yellow-200  rounded text-sm text-gray-700 ">
                  <span className="font-medium">Notes: </span>{order.notes}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200  space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Subtotal:</span>
                  <span className="text-gray-900 ">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Tax:</span>
                  <span className="text-gray-900 ">${order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 ">Service:</span>
                  <span className="text-gray-900 ">${order.serviceCharge.toFixed(2)}</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 ">
                  <span className="text-gray-900 ">Total:</span>
                  <span className="text-gray-900 ">
                    ${Math.max(0, order.totalAmount + order.taxAmount + order.serviceCharge - (order.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {/* Status Progression Buttons */}
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Mark Served
                    </button>
                  )}
                </div>

                {/* Payment Buttons for Served Orders */}
                {order.status === 'served' && (
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Process Payment to Complete:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayment(order.id, 'cash')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm inline-flex items-center justify-center gap-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        Cash
                      </button>
                      <button
                        onClick={() => handlePayment(order.id, 'card')}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center justify-center gap-1"
                      >
                        <CreditCard className="w-4 h-4" />
                        Card
                      </button>
                      {order.type === 'room-service' && (
                        <button
                          onClick={() => handleRoomCharge(order.id)}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Room Charge
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit and Cancel Buttons */}
                {order.status !== 'served' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm inline-flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm inline-flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {activeOrders.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 ">
              No active orders
            </div>
          )}
        </div>
      </div>

      {/* Completed Orders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed & Paid Orders</h2>
        <div className="bg-white  rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {order.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.type === 'dine-in' ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="space-y-1 max-w-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          <div className="text-gray-900 font-medium">
                            {item.quantity}x {item.menuItemName}
                          </div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs text-gray-500 ml-3">
                              {item.modifiers.map(mod => mod.modifierName).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Math.max(0, order.totalAmount + order.taxAmount + order.serviceCharge - (order.discountAmount || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentMethod && (
                        <p className="text-xs text-gray-500 capitalize">
                          {order.paymentMethod === 'room_charge' ? 'Room Charge' : order.paymentMethod}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.completedAt ? new Date(order.completedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Create New Order"
        submitText="Create Order"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Order Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="dine-in">Dine-In</option>
              <option value="room-service">Room Service</option>
            </select>
          </div>

          {formData.type === 'dine-in' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Table Number *</label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                placeholder="T5"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">Room Number *</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="101"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Add Items</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select menu item...</option>
                {menuItems.filter(m => m.isAvailable).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ${item.basePrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                placeholder="Qty"
                className="w-20 px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addItemToOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>

            {/* Modifiers Selection */}
            {selectedMenuItem && getAvailableModifiers(selectedMenuItem).length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Available Modifiers (Optional)</label>
                <div className="space-y-1">
                  {getAvailableModifiers(selectedMenuItem).map(modifier => (
                    <label key={modifier.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedModifiers.includes(modifier.id)}
                        onChange={() => toggleModifier(modifier.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="flex-1 text-gray-900 dark:text-white">{modifier.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {modifier.price > 0 ? `+$${modifier.price.toFixed(2)}` : 'Free'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.items.length > 0 && (
              <div className="border border-gray-200  rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700  mb-2">Order Items:</p>
                {formData.items.map((item, idx) => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  const itemModifiers = item.modifiers.map(modId => modifiers.find(m => m.id === modId)!);
                  const modifiersPrice = itemModifiers.reduce((sum, mod) => sum + mod.price, 0);
                  const itemTotal = ((menuItem?.basePrice || 0) + modifiersPrice) * item.quantity;

                  return (
                    <div key={idx} className="py-1 border-b border-gray-200 dark:border-zinc-700 last:border-0">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{item.quantity}x {menuItem?.name}</span>
                          {itemModifiers.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 ml-4">
                              {itemModifiers.map(mod => mod.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">${itemTotal.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeItemFromOrder(idx)}
                            className="text-red-600 hover:text-red-800  text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Special Instructions</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave at 0 for no discount.</p>
          </div>
        </div>
      </FormModal>

      {/* Edit Order Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOrder(null);
        }}
        onSubmit={handleEditSubmit}
        title="Edit Order"
        submitText="Update Order"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="dine-in">Dine-In</option>
              <option value="room-service">Room Service</option>
            </select>
          </div>

          {formData.type === 'dine-in' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Number *</label>
              <input
                type="text"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                placeholder="T5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Items</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select menu item...</option>
                {menuItems.filter(m => m.isAvailable).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ${item.basePrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                placeholder="Qty"
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addItemToOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>

            {formData.items.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                {formData.items.map((item, idx) => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  return (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <span className="text-sm">{item.quantity}x {menuItem?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">${((menuItem?.basePrice || 0) * item.quantity).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeItemFromOrder(idx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave at 0 for no discount.</p>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

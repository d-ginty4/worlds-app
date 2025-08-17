import { useState, useEffect, useMemo } from 'react';

function App() {
    const [orders, setOrders] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await fetch('/orders.json');
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    // Filter orders based on search term and filter type
    const filteredOrders = useMemo(() => {
        if (!searchTerm.trim()) return orders;

        const searchLower = searchTerm.toLowerCase();

        return Object.fromEntries(
            Object.entries(orders).filter(([orderId, order]) => {
                switch (filterType) {
                    case 'name':
                        return order.name.toLowerCase().includes(searchLower);

                    case 'orderNumber':
                        return orderId.includes(searchTerm);

                    case 'items':
                        return order.items.some(item =>
                            item.name.toLowerCase().includes(searchLower) ||
                            (item.variant && item.variant.toLowerCase().includes(searchLower))
                        );

                    case 'all':
                    default:
                        // Search in name, order ID, and items
                        const nameMatch = order.name.toLowerCase().includes(searchLower);
                        const orderIdMatch = orderId.includes(searchTerm);
                        const itemsMatch = order.items.some(item =>
                            item.name.toLowerCase().includes(searchLower) ||
                            (item.variant && item.variant.toLowerCase().includes(searchLower))
                        );
                        return nameMatch || orderIdMatch || itemsMatch;
                }
            })
        );
    }, [orders, searchTerm, filterType]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading) return <div className="p-4">Loading orders...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    const totalOrders = Object.keys(orders).length;
    const filteredCount = Object.keys(filteredOrders).length;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Natural Strongman World Order Management</h1>

            {/* Search and Filter Controls */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Search All</option>
                        <option value="name">Customer Name</option>
                        <option value="orderNumber">Order Number</option>
                        <option value="items">Items/Products</option>
                    </select>

                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    Showing {filteredCount} of {totalOrders} orders
                    {searchTerm && (
                        <span className="ml-2 font-medium">
              (filtered by "{searchTerm}" in {filterType === 'all' ? 'all fields' : filterType})
            </span>
                    )}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {Object.keys(filteredOrders).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No orders match your search criteria.' : 'No orders found.'}
                    </div>
                ) : (
                    Object.entries(filteredOrders)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by order ID descending
                        .map(([orderId, order]) => (
                            <OrderCard key={orderId} orderId={orderId} order={order} searchTerm={searchTerm} />
                        ))
                )}
            </div>
        </div>
    );
}

// Highlight matching text helper function
function HighlightText({ text, highlight }) {
    if (!highlight.trim()) return <span>{text}</span>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
      {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
              <mark key={index} className="bg-yellow-200">{part}</mark>
          ) : (
              <span key={index}>{part}</span>
          )
      )}
    </span>
    );
}

// Separate component for each order
function OrderCard({ orderId, order, searchTerm }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    Order #<HighlightText text={orderId} highlight={searchTerm} />
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.financialStatus === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
          {order.financialStatus}
        </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">
                        <HighlightText text={order.name} highlight={searchTerm} />
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-lg text-green-600">€{order.total}</p>
                    <p className="text-sm text-gray-500">{order.paidAt}</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Items:</p>
                {order.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                        <p className="font-medium">
                            <HighlightText text={item.name} highlight={searchTerm} />
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                €{item.price} × {item.quantity}
                  {item.variant && (
                      <span className="ml-2 text-blue-600">
                    (<HighlightText text={item.variant} highlight={searchTerm} />)
                  </span>
                  )}
              </span>
                            <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-sm text-gray-500">
                <p><strong>Billing Address:</strong> {order.billingAddress}</p>
                <p><strong>Payment Summary:</strong> {order.paymentSummary}</p>
            </div>
        </div>
    );
}

export default App

import {useMemo, useState} from 'react';
import Order from './components/Order.tsx';
import {useOrderData} from "./hooks/useOrderData.tsx";

function App() {
    const {orders, loading, error, hasMore, totalLoaded} = useOrderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredOrders = useMemo(() => {
        if (!searchTerm.trim()) return orders;

        const searchLower = searchTerm.toLowerCase();

        return orders.filter(order => {
            switch (filterType) {
                case 'name':
                    return order.name.toLowerCase().includes(searchLower);

                case 'orderNumber':
                    return order.orderNumber.includes(searchTerm);

                case 'items':
                    return order.items.some(item =>
                        item.itemName.toLowerCase().includes(searchLower) ||
                        (item.itemVariant && item.itemVariant.toLowerCase().includes(searchLower))
                    );

                case 'all':
                default:
                    // Search in name, order ID, and items
                    const nameMatch = order.name.toLowerCase().includes(searchLower);
                    const orderIdMatch = order.orderNumber.includes(searchTerm);
                    const itemsMatch = order.items.some(item =>
                        item.itemName.toLowerCase().includes(searchLower) ||
                        (item.itemVariant && item.itemVariant.toLowerCase().includes(searchLower))
                    );
                    return nameMatch || orderIdMatch || itemsMatch;
            }
        });
    }, [orders, searchTerm, filterType]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading && orders.length === 0) {
        return <div className="p-4">Loading orders...</div>;
    }

    const totalOrders = Object.keys(orders).length;
    const filteredCount = Object.keys(filteredOrders).length;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Natural Strongman Worlds: Order Management</h1>

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
                    {loading && hasMore && (
                        <span className="ml-2 text-blue-600 font-medium">
                            (Loading more... {totalLoaded} loaded so far)
                        </span>
                    )}
                    {searchTerm && (
                        <span className="ml-2 font-medium">
                            (filtered by "{searchTerm}" in {filterType === 'all' ? 'all fields' : filterType})
                        </span>
                    )}
                </div>
            </div>

            {error ? (
                <div className="text-center py-8 text-red-500">
                    Error loading orders: {error}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No orders match your search criteria.' : 'No orders found.'}
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <Order key={order.id} order={order} searchTerm={searchTerm}/>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default App

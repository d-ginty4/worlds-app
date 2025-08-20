import {useMemo, useState} from 'react';
import Order from './components/Order.tsx';
import {useOrderData} from "./hooks/useOrderData.tsx";
import type {OrderData} from "./types";

function App() {
    const {orders, loading, error, hasMore, totalLoaded} = useOrderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');

    // Built-in filters - customize these based on your specific needs
    const builtInFilters = [
        {
            id: 'all',
            label: 'All Orders',
            filter: () => true
        },
        {
            id: 'worldsTickets',
            label: 'Worlds tickets',
            filter: (order: OrderData) => order.items.some(item => {
                    const worldsTickets = 'Natural Worlds Strongest Man & Woman 2025 – Weekend Tickets'
                    return item.itemName.toLowerCase().includes(worldsTickets.toLowerCase())
                }
            )
        },
    ];

    const filteredOrders = useMemo(() => {
        const builtInFilter = builtInFilters.find(f => f.id === activeFilter);
        const baseFilteredOrders = builtInFilter
            ? orders.filter(builtInFilter.filter)
            : orders;

        if (!searchTerm.trim()) return baseFilteredOrders;

        const searchLower = searchTerm.toLowerCase();

        return baseFilteredOrders.filter(order => {
            const nameMatch = order.name.toLowerCase().includes(searchLower);
            const orderIdMatch = order.orderNumber.includes(searchTerm);
            const itemsMatch = order.items.some(item =>
                item.itemName.toLowerCase().includes(searchLower) ||
                (item.itemVariant && item.itemVariant.toLowerCase().includes(searchLower)))

            switch (filterType) {
                case 'name':
                    return nameMatch

                case 'orderNumber':
                    return orderIdMatch

                case 'items':
                    return itemsMatch

                case 'all':
                default:
                    return nameMatch || orderIdMatch || itemsMatch;
            }
        });
    }, [orders, searchTerm, filterType, activeFilter]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading && orders.length === 0) {
        return <div className="p-4">Loading orders...</div>;
    }

    const totalOrders = orders.length;
    const baseFilteredCount = activeFilter === 'all'
        ? orders.length
        : orders.filter(builtInFilters.find(f => f.id === activeFilter).filter).length;
    const filteredCount = filteredOrders.length;

    const printList = () => {
        const printWindow = window.open('', '_blank');

        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        const filterInfo = activeFilter !== 'all' ?
            `Filtered by: ${builtInFilters.find(f => f.id === activeFilter)?.label}` :
            'All Orders';

        const searchInfo = searchTerm ?
            `Search: "${searchTerm}" in ${filterType === 'all' ? 'all fields' : filterType}` :
            '';

        const tableRows = filteredOrders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.name}</td>
                <td>${order.email}</td>
                <td>${order.subTotal.toFixed(2)}</td>
                <td>${order.grandTotal.toFixed(2)}</td>
                <td>${order.items.length}</td>
                <td>
                    ${order.items.map(item =>
            `${item.itemName}${item.itemVariant ? ` (${item.itemVariant})` : ''} - Qty: ${item.quantity}, ${item.price.toFixed(2)}`
        ).join('<br/>')}
                </td>
            </tr>
        `).join('');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orders Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .header .info {
                        margin-top: 10px;
                        font-size: 14px;
                        color: #666;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        vertical-align: top;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .items-column {
                        max-width: 300px;
                        font-size: 11px;
                        line-height: 1.4;
                    }
                    .summary {
                        margin-top: 20px;
                        font-size: 14px;
                        font-weight: bold;
                    }
                    @media print {
                        body { margin: 15px; }
                        .no-print { display: none; }
                        table { font-size: 11px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Natural Strongman Worlds - Orders Report</h1>
                    <div class="info">
                        <div>Generated on: ${dateStr} at ${timeStr}</div>
                        <div>${filterInfo}</div>
                        ${searchInfo ? `<div>${searchInfo}</div>` : ''}
                        <div>Total Orders: ${filteredCount}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>Items</th>
                            <th class="items-column">Items Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <div class="summary">
                    Total Revenue: ${filteredOrders.reduce((sum, order) => sum + order.grandTotal, 0).toFixed(2)}
                </div>

                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Print This Report
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Close
                    </button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
    };

    const downloadList = () => {
        // Create CSV headers
        const headers = [
            'Order Number',
            'Name',
            'Email',
        ];

        // Convert orders to CSV rows
        const csvRows = [
            headers.join(','),
            ...filteredOrders.map(order => {
                return [
                    order.orderNumber,
                    `"${order.name}"`,
                    order.email,
                ].join(',');
            })
        ];

        // Create and download the file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);

            // Generate filename with current date and filter info
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
            const filterStr = activeFilter !== 'all' ? `_${activeFilter}` : '';
            const searchStr = searchTerm ? `_search-${searchTerm.replace(/[^a-zA-Z0-9]/g, '')}` : '';

            link.setAttribute('download', `orders_${dateStr}${filterStr}${searchStr}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Natural Strongman Worlds: Order Management</h1>

            <div className="flex flex-wrap gap-2 pb-4">
                <button
                    onClick={printList}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-green-600 text-white`}
                >
                    Print List
                </button>
                <button
                    onClick={downloadList}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-orange-600 text-white`}
                >
                    Download List
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg mb-6 border">
                <h3 className="text-lg font-medium mb-3">Quick Filters</h3>
                <div className="flex flex-wrap gap-2">
                    {builtInFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeFilter === filter.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

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
                    {activeFilter !== 'all' && (
                        <span>
                            Filtered to: <span
                            className="font-medium text-blue-600">{builtInFilters.find(f => f.id === activeFilter)?.label}</span>
                            ({baseFilteredCount} orders) •
                        </span>
                    )}
                    Showing {filteredCount} of {totalOrders} orders
                    {loading && hasMore && (
                        <span className="ml-2 text-blue-600 font-medium">
                            (Loading more... {totalLoaded} loaded so far)
                        </span>
                    )}
                    {searchTerm && (
                        <span className="ml-2 font-medium">
                            (search: "{searchTerm}" in {filterType === 'all' ? 'all fields' : filterType})
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

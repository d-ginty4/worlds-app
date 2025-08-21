import {useMemo, useState} from 'react';
import Order from './components/Order.tsx';
import {useOrderData} from "./hooks/useOrderData.tsx";
import type {OrderData, OrderItem} from "./types";
import downloadData from "./utils/downloadData.ts";

function App() {
    const {orders, loading, error, hasMore, totalLoaded} = useOrderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const worldsCoachesPass = `Coach's Pass - Natural Worlds Strongest Man & Woman 2025`
    const worldsTickets = 'Natural Worlds Strongest Man & Woman 2025 – Weekend Tickets'

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
                    return item.itemName.toLowerCase().includes(worldsTickets.toLowerCase())
                }
            )
        },
        {
            id: 'worldsCoachesPass',
            label: 'Worlds Coaches Passes',
            filter: (order: OrderData) => order.items.some(item => {
                    return item.itemName.toLowerCase().includes(worldsCoachesPass.toLowerCase())
                }
            )
        },
        {
            id: 'refunded',
            label: 'Refunded Orders',
            filter: (order: OrderData) => {
                return order.refunded
            }
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

            return nameMatch || orderIdMatch || itemsMatch;
        });
    }, [orders, searchTerm, activeFilter]);

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

    const downloadWorldsTickets = () => {
        const headers = [
            'Order Number',
            'Name',
            "Email",
            "Ticket Name",
            "Ticket Type",
            "Ticket Price",
            "Quantity",
            "Day 1",
            "Day 2",
            "Day 3",
        ];

        const data = []
        orders.filter(order => !order.refunded && order.items.some(item => {
                return item.itemName.toLowerCase().includes(worldsTickets.toLowerCase())
            }
        )).forEach(order => {
            let tempItem: OrderItem
            if (order.items.length > 0) {
                order.items.forEach(item => {
                    if (item.itemName == worldsTickets) {
                        tempItem = item
                    }
                })
            } else {
                tempItem = order.items[0]
            }

            const temp = {
                orderNumber: order.orderNumber,
                name: order.name,
                email: order.email,
                ticketName: tempItem.itemName,
                ticketType: tempItem.itemVariant,
                ticketPrice: tempItem.price,
                quantity: tempItem.quantity,
            }

            data.push(temp)
        })

        downloadData('worlds-2025-tickets', headers, data)
    }

    const downloadWorldsCoachesPasses = () => {
        const headers = [
            'Order Number',
            'Name',
            "Email",
            "Ticket Name",
            "Quantity",
            "Day 1",
            "Day 2",
            "Day 3",
        ];

        const data = []
        orders.filter(order => !order.refunded && order.items.some(item => {
                return item.itemName.toLowerCase().includes(worldsCoachesPass.toLowerCase())
            }
        )).forEach(order => {
            let tempItem: OrderItem
            if (order.items.length > 0) {
                order.items.forEach(item => {
                    if (item.itemName == worldsCoachesPass) {
                        tempItem = item
                    }
                })
            } else {
                tempItem = order.items[0]
            }

            const temp = {
                orderNumber: order.orderNumber,
                name: order.name,
                email: order.email,
                ticketName: tempItem.itemName,
                quantity: tempItem.quantity,
            }

            data.push(temp)
        })

        downloadData('worlds-2025-coaches-passes', headers, data)
    }

    const showTicketBreakDownModal = () => {
        let seatedTickets = 0
        let standingTickets = 0
        orders.forEach(order => {
            if (order.refunded) {
                return
            }

            order.items.forEach(item => {
                if (item.itemName.toLowerCase().includes(worldsTickets.toLowerCase())) {
                    if (item.itemVariant === "Weekend Tiered Seating") {
                        seatedTickets += item.quantity
                    } else {
                        standingTickets += item.quantity
                    }
                }
            })
        })

        let standingUpgrade = 0
        orders.forEach(order => {
            if (order.refunded) {
                return
            }
            order.items.forEach(item => {
                if (item.itemName.toLowerCase().includes("Natural Worlds Strongest Man & Woman 2025 – Weekend Standing Upgrade".toLowerCase())) {
                    standingUpgrade += item.quantity
                }
            })
        })

        let coachesPass = 0
        orders.forEach(order => {
            if (order.refunded) {
                return
            }
            order.items.forEach(item => {
                if (item.itemName.toLowerCase().includes(worldsCoachesPass.toLowerCase())) {
                    coachesPass += item.quantity
                }
            })
        })

        let str = `Seated Tickets: ${seatedTickets}\n`
        str += `Standing Tickets: ${standingTickets}\n`
        str += `Standing Upgrade Tickets: ${standingUpgrade}\n`
        str += `Coaches Pass: ${coachesPass}\n`

        alert(str)
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Natural Strongman: Order Management</h1>

            <div className="flex flex-wrap gap-2 pb-4">
                <button
                    onClick={downloadWorldsTickets}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-green-600 text-white`}
                >
                    Download Worlds Tickets Data
                </button>
                <button
                    onClick={downloadWorldsCoachesPasses}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-orange-600 text-white`}
                >
                    Download Coaches Passes Data
                </button>
                <button
                    onClick={showTicketBreakDownModal}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors bg-purple-600 text-white`}
                >
                    Worlds Ticket Breakdown
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

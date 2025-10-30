import {useEffect, useState, useRef} from 'react';
import type {OrderData, OrderItem} from "../types/index.ts";

export const useOrderData = (): {
    orders: OrderData[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalLoaded: number;
} => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalLoaded, setTotalLoaded] = useState(0);
    const fetchedRef = useRef(false);

    const transformOrder = (rawOrder): OrderData => {
        const order: OrderData = {
            id: rawOrder.id,
            orderNumber: rawOrder.orderNumber,
            name: "<Redacted>",
            email: "<Redacted>",
            subTotal: rawOrder.subtotal.value,
            grandTotal: rawOrder.grandTotal.value,
            refunded: false,
            items: []
        }

        console.log("here 1");
        if (rawOrder.refundedTotal && rawOrder.refundedTotal.value !== "0.00") {
            order.refunded = true;
        }

        console.log("here 2");
        for (const rawItem of rawOrder.lineItems) {
            const item: OrderItem = {
                itemName: rawItem.productName,
                price: rawItem.unitPricePaid.value,
                quantity: rawItem.quantity,
            }

            console.log("here 3");
            if (rawItem.variantOptions.length > 0) {
                item.itemVariant = rawItem.variantOptions[0].value
            }

            order.items.push(item)
        }

        return order
    }

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const getOrdersPage = async (cursor: string): Promise<{
            orders: OrderData[];
            nextCursor: string
        }> => {
            let fullUrl: string;
            let headers
            if (import.meta.env.VITE_ENVIRONMENT === "local") {
                fullUrl = '/api/squarespace/1.0/commerce/orders'
                if (cursor != '') {
                    fullUrl += `?cursor=${cursor}`
                }

                headers = {
                    'Authorization': `Bearer ${import.meta.env.VITE_SQUARESPACE_KEY}`
                }
            } else {
                const proxyUrl = import.meta.env.VITE_API_BASE;
                let url = 'https://api.squarespace.com/1.0/commerce/orders';
                if (cursor != '') {
                    url += `?cursor=${cursor}`
                }

                fullUrl = `${proxyUrl}?url=${url}`
                headers = {
                    'Content-Type': 'application/json',
                }
            }

            const resp = await fetch(fullUrl, {
                method: 'GET',
                headers: headers,
            })
            if (!resp.ok) {
                setError("Unable to get orders")
                throw new Error(`HTTP error! status: ${resp.status}`);
            }

            const data = await resp.json();
            const rawOrders = data.result
            const nextCursor = data.pagination.nextPageCursor
            const orders: OrderData[] = rawOrders.map(order => transformOrder(order))

            return {orders, nextCursor};
        }

        const getOrders = async () => {
            setLoading(true);
            setError(null);
            let cursor = ''
            try {
                while (true) {
                    const pageData = await getOrdersPage(cursor);
                    setOrders(prev => [...prev, ...pageData.orders]);
                    setTotalLoaded(prev => prev + pageData.orders.length);

                    // Check if there are more pages
                    if (!pageData.nextCursor) {
                        setHasMore(false);
                        break;
                    }
                    cursor = pageData.nextCursor;

                    //a small delay to prevent overwhelming the server
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                setError(errorMessage);
                console.error('Error fetching orders:', e);
            } finally {
                setLoading(false);
            }
        }

        getOrders()
    }, []);

    return {
        orders,
        loading,
        error,
        hasMore,
        totalLoaded,
    };
};
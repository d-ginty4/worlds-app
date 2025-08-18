import {useEffect, useState} from 'react';
import type {OrderData, OrderItem} from "../types/index.ts";

export const useOrderData = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const transformOrder = (rawOrder): OrderData => {
        const order: OrderData = {
            id: rawOrder.id,
            orderNumber: rawOrder.orderNumber,
            name: `${rawOrder.billingAddress.firstName} ${rawOrder.billingAddress.lastName}`,
            email: rawOrder.customerEmail,
            subTotal: rawOrder.subtotal.value,
            grandTotal: rawOrder.grandTotal.value,
            items: []
        }

        for (const rawItem of rawOrder.lineItems) {
            const item: OrderItem = {
                itemName: rawItem.productName,
                price: rawItem.unitPricePaid.value,
                quantity: rawItem.quantity,
            }

            if (rawItem.variantOptions.length > 0) {
                item.itemVariant = rawItem.variantOptions[0].value
            }

            order.items.push(item)
        }

        return order
    }

    useEffect(() => {
        const getOrdersPage = async (cursor: string): Promise<{
            orders: OrderData[];
            nextCursor: string
        }> => {
            let url = '/api/squarespace/1.0/commerce/orders'
            if (cursor != ''){
                url += `?cursor=${cursor}`
            }

            const resp = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SQUARESPACE_KEY}`
                }
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

        const getOrders = async (): Promise<OrderData[]> => {
            const allOrders: OrderData[] = []
            let cursor = ''
            while (true) {
                const pageData = await getOrdersPage(cursor);
                allOrders.push(...pageData.orders);

                if (!pageData.nextCursor || pageData.nextCursor === "" || pageData.nextCursor === null) {
                    break;
                }else {
                    cursor = pageData.nextCursor
                }
            }

            return allOrders
        }

        setLoading(true)
        try {
            getOrders().then(orders => {
                setOrders(orders);
            })
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    });

    return {
        orders,
        loading,
        error,
    };
};
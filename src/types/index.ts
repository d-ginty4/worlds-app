export interface OrderItem {
    itemName: string;
    itemVariant?: string;
    price: number;
    quantity: number;
}

export interface OrderData {
    id: string,
    orderNumber: string,
    name: string,
    email: string,
    subTotal: number,
    grandTotal: number,
    items: OrderItem[],
}
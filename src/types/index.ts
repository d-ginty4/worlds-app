export interface OrderItem {
    itemName: string;
    itemVariant?: string;
    price: number;
    quantity: number;
}

export interface OrderData {
    id: string,
    orderNumber: number,
    name: string,
    email: string,
    subTotal: number,
    grandTotal: number,
    items: OrderItem[],
}
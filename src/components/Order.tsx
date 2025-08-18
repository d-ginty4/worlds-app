import type {OrderData} from "../types";

type OrderProps = {
    order: OrderData
    searchTerm: string;
}

function Order({order, searchTerm}: OrderProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    Order #<HighlightText text={order.orderNumber} highlight={searchTerm}/>
                </h3>
                {/*<span className={`px-2 py-1 rounded text-xs font-medium ${*/}
                {/*    order.financialStatus === 'PAID'*/}
                {/*        ? 'bg-green-100 text-green-800'*/}
                {/*        : 'bg-yellow-100 text-yellow-800'*/}
                {/*}`}>*/}
                {/*  {order.financialStatus}*/}
                {/*</span>*/}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">
                        <HighlightText text={order.name} highlight={searchTerm}/>
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-lg text-green-600">€{order.grandTotal}</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Items:</p>
                {order.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                        <p className="font-medium">
                            <HighlightText text={item.itemName} highlight={searchTerm}/>
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>
                                €{item.price} × {item.quantity}
                                  {item.itemVariant && (
                                      <span className="ml-2 text-blue-600">
                                    (<HighlightText text={item.itemVariant} highlight={searchTerm}/>)
                                  </span>
                                  )}
                              </span>
                            <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/*<div className="text-sm text-gray-500">*/}
            {/*    <p><strong>Billing Address:</strong> {order.billingAddress}</p>*/}
            {/*    <p><strong>Payment Summary:</strong> {order.paymentSummary}</p>*/}
            {/*</div>*/}
        </div>
    );
}

function HighlightText({text, highlight}) {
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

export default Order;
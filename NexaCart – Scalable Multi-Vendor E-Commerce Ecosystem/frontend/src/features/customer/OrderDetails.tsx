import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { ArrowLeft, CreditCard, ShieldAlert, XSquare, Package } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface OrderItemResponse {
  id: number;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  fulfillmentStatus: string;
}

interface AddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderResponse {
  id: number;
  orderNumber: string;
  totalPrice: number;
  discount: number;
  status: string;
  createdAt: string;
  shippingAddress: AddressDto;
  items: OrderItemResponse[];
}

const OrderDetails: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(`/api/v1/orders/${orderNumber}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order details not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const response = await axiosClient.post(`/api/v1/orders/${order.orderNumber}/cancel`);
      if (response.data.success) {
        fetchOrderDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4">
        <ShieldAlert className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Order not found.'}</p>
        <Link to="/orders" className="px-6 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-semibold text-sm transition-colors">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'PENDING_PAYMENT';

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back link */}
        <Link to="/orders" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} />
          <span>Back to History</span>
        </Link>

        {/* Order Header */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-xl font-bold text-white">Order #{order.orderNumber}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  order.status === 'PAID'
                    ? 'bg-green-950 text-green-400 border border-green-900'
                    : order.status === 'PENDING_PAYMENT'
                    ? 'bg-yellow-950 text-yellow-400 border border-yellow-900'
                    : 'bg-red-950/50 text-red-400 border border-red-900'
                }`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex gap-3">
            {isPending && (
              <>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-900 hover:bg-red-900/20 text-red-400 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <XSquare size={14} />
                  <span>Cancel Order</span>
                </button>
                <Link
                  to={`/payment-verify?orderNumber=${order.orderNumber}&amount=${order.totalPrice}`}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center space-x-1.5 transition-all text-white"
                >
                  <CreditCard size={14} />
                  <span>Complete Payment</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items & Shipping */}
          <div className="md:col-span-2 space-y-6">
            {/* Items */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider mb-4">Ordered Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3.5 border-b border-slate-850 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-white text-sm">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        SKU: {item.sku} &bull; Qty: {item.quantity}
                      </p>
                      <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-semibold text-indigo-400">
                        <Package size={10} />
                        <span>Fulfillment: {item.fulfillmentStatus}</span>
                      </span>
                    </div>
                    <span className="font-bold text-white text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider mb-3">Shipping Location</h3>
              {order.shippingAddress ? (
                <div className="text-slate-300 text-sm space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No shipping details.</p>
              )}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="md:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-sm">
              <h3 className="font-bold text-slate-400 border-b border-slate-850 pb-3">Financial Break</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-slate-550">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">${(order.totalPrice + order.discount).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-slate-550">
                    <span>Discount</span>
                    <span className="text-green-400 font-semibold">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-550">
                  <span>Shipping</span>
                  <span className="text-green-400 font-semibold">FREE</span>
                </div>
                <div className="border-t border-slate-850 pt-3 flex justify-between text-base font-extrabold text-white">
                  <span>Total Paid</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

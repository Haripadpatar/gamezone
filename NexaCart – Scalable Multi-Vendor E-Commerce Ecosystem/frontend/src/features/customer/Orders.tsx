import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { ClipboardList, Eye } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface OrderItemResponse {
  id: number;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  fulfillmentStatus: string;
}

interface OrderResponse {
  id: number;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/v1/orders/history');
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl font-extrabold mb-8">Your Orders</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/45 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl p-8 flex flex-col items-center">
            <ClipboardList size={48} className="text-slate-650 mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders placed</h2>
            <p className="text-slate-500 text-sm mb-6">You haven't placed any orders yet.</p>
            <Link to="/products" className="px-6 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-semibold text-sm transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0c1222]/65 border border-slate-800 rounded-2xl p-6 hover:border-slate-750 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3.5 mb-2">
                    <span className="text-sm font-bold text-white">#{order.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'PAID'
                          ? 'bg-green-950 text-green-450 border border-green-900'
                          : order.status === 'PENDING_PAYMENT'
                          ? 'bg-yellow-950 text-yellow-450 border border-yellow-900'
                          : 'bg-red-950/50 text-red-400 border border-red-900'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()} &bull; {order.items.length} item(s)
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-850 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Amount</p>
                    <p className="text-base font-extrabold text-white">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="flex items-center space-x-1.5 py-2 px-3.5 rounded-lg bg-[#0e1423] border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

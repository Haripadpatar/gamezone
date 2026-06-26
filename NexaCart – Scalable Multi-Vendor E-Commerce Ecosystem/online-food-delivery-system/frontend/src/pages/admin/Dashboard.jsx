import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          orderAPI.adminGetDashboardStats(),
          orderAPI.adminGetAll()
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5)); // Take first 5 recent orders
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <AdminNav />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mt-20"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Delivered Orders", value: stats.deliveredOrders, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Total Revenue", value: `₹${parseFloat(stats.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Admin Nav */}
      <AdminNav />

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`rounded-2xl border p-5 flex items-center justify-between bg-slate-900/60 ${card.bg}`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold">{card.label}</span>
                <span className="text-2xl font-black text-white">{card.value}</span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Content: Recent Orders */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <h3 className="font-bold text-base text-slate-200">Recent Pending Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1">
            View All Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No orders placed yet.
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4 text-left">Order Number</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">{order.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-left font-medium text-slate-300">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500">{order.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">₹{order.totalAmount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        order.status === 'CANCELLED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        to="/admin/orders" 
                        className="text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 px-3.5 py-1.5 rounded-lg transition-all inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

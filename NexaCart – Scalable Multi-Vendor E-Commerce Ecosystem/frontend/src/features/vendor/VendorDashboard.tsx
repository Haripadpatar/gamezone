import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { DollarSign, ShoppingBag, ArrowUpRight, Boxes, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLoader from '../../core/components/PageLoader';

interface SalesDataPoint {
  label: string;
  value: number;
}

interface VendorAnalytics {
  totalEarnings: number;
  totalOrders: number;
  totalProductsSold: number;
  lowStockAlerts: number;
  salesHistory: SalesDataPoint[];
}

const VendorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/v1/vendor/analytics');
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (err: any) {
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-2xl text-red-400 text-sm">
        {error || 'Analytics not available.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Earnings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Earnings</p>
            <h3 className="text-2xl font-extrabold text-white">${analytics.totalEarnings.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-950 text-emerald-450 border border-emerald-900/60 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Orders */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-white">{analytics.totalOrders}</h3>
          </div>
          <div className="p-3 bg-indigo-950 text-indigo-450 border border-indigo-900/60 rounded-xl">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Sold Products */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Products Sold</p>
            <h3 className="text-2xl font-extrabold text-white">{analytics.totalProductsSold}</h3>
          </div>
          <div className="p-3 bg-purple-950 text-purple-450 border border-purple-900/60 rounded-xl">
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Low Stock Alerts</p>
            <h3 className={`text-2xl font-extrabold ${analytics.lowStockAlerts > 0 ? 'text-amber-450' : 'text-white'}`}>
              {analytics.lowStockAlerts}
            </h3>
          </div>
          <div className={`p-3 rounded-xl border ${
            analytics.lowStockAlerts > 0
              ? 'bg-amber-950 text-amber-450 border-amber-900/60'
              : 'bg-slate-900 text-slate-500 border-slate-850'
          }`}>
            <Boxes size={20} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-lg text-white mb-6">Sales History</h3>
        {analytics.salesHistory && analytics.salesHistory.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesHistory}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500 italic text-sm">
            No sales data recorded yet.
          </div>
        )}
      </div>

      {/* Warning Alert if Low Stock */}
      {analytics.lowStockAlerts > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-400 flex items-center space-x-3 text-sm">
          <AlertTriangle size={18} />
          <span>
            You have <strong>{analytics.lowStockAlerts}</strong> variants running low on stock. Please verify your inventory logs.
          </span>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;

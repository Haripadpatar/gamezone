import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { DollarSign, Landmark, ClipboardList, Store, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLoader from '../../core/components/PageLoader';

interface SalesDataPoint {
  label: string;
  value: number;
}

interface AdminAnalytics {
  totalPlatformRevenue: number;
  totalCommissionEarned: number;
  totalOrders: number;
  totalVendors: number;
  totalCustomers: number;
  totalActiveStores: number;
  platformSalesHistory: SalesDataPoint[];
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/v1/admin/analytics');
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (err) {
        setError('Failed to load global platform metrics.');
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
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-550 text-xs font-semibold uppercase tracking-wider mb-1">Platform Revenue</p>
            <h3 className="text-2xl font-extrabold text-white">${analytics.totalPlatformRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-900/65 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-550 text-xs font-semibold uppercase tracking-wider mb-1">Commission Earned</p>
            <h3 className="text-2xl font-extrabold text-white">${analytics.totalCommissionEarned.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-950 text-emerald-455 border border-emerald-900/65 rounded-xl">
            <Landmark size={20} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-555 text-xs font-semibold uppercase tracking-wider mb-1">Platform Orders</p>
            <h3 className="text-2xl font-extrabold text-white">{analytics.totalOrders}</h3>
          </div>
          <div className="p-3 bg-purple-950 text-purple-455 border border-purple-900/65 rounded-xl">
            <ClipboardList size={20} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-555 text-xs font-semibold uppercase tracking-wider mb-1">Active Stores</p>
            <h3 className="text-2xl font-extrabold text-white">{analytics.totalActiveStores}</h3>
          </div>
          <div className="p-3 bg-blue-950 text-blue-455 border border-blue-900/65 rounded-xl">
            <Store size={20} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-lg text-white mb-6">Marketplace Sales</h3>
        {analytics.platformSalesHistory && analytics.platformSalesHistory.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.platformSalesHistory}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500 italic text-sm">
            No sales recorded on the platform yet.
          </div>
        )}
      </div>

      {/* Quick accounts metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-[#0e1423] text-indigo-400 border border-slate-800 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Customers Count</h4>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.totalCustomers}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-[#0e1423] text-indigo-400 border border-slate-800 rounded-xl">
            <Store size={22} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Registered Vendors</h4>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.totalVendors}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

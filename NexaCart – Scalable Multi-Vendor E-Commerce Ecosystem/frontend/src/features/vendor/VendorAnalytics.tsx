import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLoader from '../../core/components/PageLoader';
import { BarChart3, LineChart, TrendingUp } from 'lucide-react';

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

const VendorAnalytics: React.FC = () => {
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
        setError('Failed to load analytics.');
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
      <div>
        <h2 className="text-xl font-bold">Store Insights</h2>
        <p className="text-slate-500 text-xs mt-0.5">Analyze monthly sales distributions and catalog performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2.5 mb-6">
            <LineChart size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white text-base">Monthly Earnings</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesHistory}>
                <defs>
                  <linearGradient id="salesGrad2" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2.5 mb-6">
            <BarChart3 size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white text-base">Volume Analysis</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Grow your Store front</h4>
            <p className="text-slate-450 text-xs mt-0.5 max-w-md">
              Maintain catalog updates, ensure stock counts are accurate, and ship items promptly to scale earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;

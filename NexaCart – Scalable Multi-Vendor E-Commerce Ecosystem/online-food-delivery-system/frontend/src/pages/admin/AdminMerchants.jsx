import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { Users, Store, Phone, Shield } from 'lucide-react';

const AdminMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = async () => {
    try {
      const res = await restaurantAPI.adminGetMerchants();
      setMerchants(res.data);
    } catch (err) {
      toast.error('Failed to load merchants');
    }
  };

  useEffect(() => {
    const loadMerchants = async () => {
      setLoading(true);
      await fetchMerchants();
      setLoading(false);
    };
    loadMerchants();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <AdminNav />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mt-20"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Admin Nav */}
      <AdminNav />

      {/* Merchant List Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div className="text-left">
          <h3 className="font-extrabold text-white text-lg">Merchant Portals</h3>
          <p className="text-slate-500 text-xs mt-0.5">List of all active restaurant merchants and store owners</p>
        </div>
      </div>

      {/* Merchant List Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          {merchants.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No merchants registered in the system.
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4 text-left">Merchant Name</th>
                  <th className="py-3 px-4 text-left">Phone Number</th>
                  <th className="py-3 px-4 text-left">Linked Restaurant</th>
                  <th className="py-3 px-4 text-left">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-rose-500" />
                        <span>{merchant.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{merchant.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold">
                          {merchant.restaurant ? merchant.restaurant.name : 'No Restaurant Linked'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>{merchant.role}</span>
                      </div>
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

export default AdminMerchants;

import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Check, X } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface VendorResponse {
  id: number;
  userId: number;
  email: string;
  businessName: string;
  taxId: string;
  verificationStatus: string;
  bankDetails: string;
  createdAt: string;
}

const VendorApproval: React.FC = () => {
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/v1/admin/vendors');
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (id: number, approve: boolean) => {
    try {
      setSubmittingId(id);
      const response = await axiosClient.post(`/api/v1/admin/vendors/${id}/approve?approved=${approve}`);
      if (response.data.success) {
        // Update local list
        setVendors(
          vendors.map((v) =>
            v.id === id
              ? { ...v, verificationStatus: approve ? 'APPROVED' : 'REJECTED' }
              : v
          )
        );
      }
    } catch (err) {
      alert('Failed to update vendor verification status.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading && vendors.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Vendor Registration Approvals</h2>
        <p className="text-slate-500 text-xs mt-0.5">Audit tax papers and approve vendor marketplace stores</p>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          No vendor store applications logged on the platform.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400 text-left">
              <thead className="bg-[#0c1222] border-b border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Business Name</th>
                  <th className="px-6 py-4">Vendor Email</th>
                  <th className="px-6 py-4">Tax ID</th>
                  <th className="px-6 py-4">Bank Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-slate-850 hover:bg-slate-900/20 last:border-0">
                    <td className="px-6 py-4 font-bold text-white">{v.businessName}</td>
                    <td className="px-6 py-4 text-slate-300">{v.email}</td>
                    <td className="px-6 py-4 font-mono text-xs">{v.taxId}</td>
                    <td className="px-6 py-4 text-xs text-slate-350 max-w-xs truncate">{v.bankDetails}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          v.verificationStatus === 'APPROVED'
                            ? 'bg-green-950 text-green-450 border border-green-900'
                            : v.verificationStatus === 'PENDING'
                            ? 'bg-yellow-950 text-yellow-450 border border-yellow-900'
                            : 'bg-red-950/50 text-red-400 border border-red-900'
                        }`}
                      >
                        {v.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {v.verificationStatus === 'PENDING' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(v.id, true)}
                            disabled={submittingId === v.id}
                            className="p-1.5 bg-green-950/80 border border-green-800 hover:bg-green-600 hover:text-white text-green-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleApprove(v.id, false)}
                            disabled={submittingId === v.id}
                            className="p-1.5 bg-red-950/80 border border-red-800 hover:bg-red-650 hover:text-white text-red-400 rounded-lg transition-all cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApproval;

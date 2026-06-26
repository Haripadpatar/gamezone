import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../core/api/axiosClient';
import { Store, ArrowRight, ArrowLeft } from 'lucide-react';

const vendorRegisterSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  bankDetails: z.string().min(1, 'Bank details are required'),
});

type VendorRegisterValues = z.infer<typeof vendorRegisterSchema>;

const VendorRegister: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorRegisterValues>({
    resolver: zodResolver(vendorRegisterSchema),
  });

  const onSubmit = async (data: VendorRegisterValues) => {
    try {
      setSubmitting(true);
      setApiError(null);

      const response = await axiosClient.post('/api/v1/vendors/register', data);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 4000);
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        {success ? (
          <div className="text-center py-6 space-y-6">
            <div className="h-16 w-16 bg-green-950/80 text-green-400 border border-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Application Submitted!</h2>
            <p className="text-slate-400 text-sm">
              Your vendor application has been logged successfully and is awaiting review by platform administrators.
            </p>
            <p className="text-xs text-slate-500">Redirecting to customer dashboard...</p>
          </div>
        ) : (
          <>
            <Link to="/dashboard" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors text-xs">
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold flex items-center space-x-2">
                <Store className="text-indigo-400" size={24} />
                <span>Become a Vendor</span>
              </h1>
              <p className="text-slate-450 text-xs mt-1">Open your store front and sell products on NexaCart.</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/45 border border-red-850 text-red-400 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Business Store Name
                </label>
                <input
                  type="text"
                  {...register('businessName')}
                  className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Acme Tech Store"
                />
                {errors.businessName && <p className="mt-1.5 text-xs text-red-500">{errors.businessName.message}</p>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Tax Registration ID
                </label>
                <input
                  type="text"
                  {...register('taxId')}
                  className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. TAX-928-182"
                />
                {errors.taxId && <p className="mt-1.5 text-xs text-red-500">{errors.taxId.message}</p>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Bank Payout Details
                </label>
                <textarea
                  {...register('bankDetails')}
                  rows={3}
                  className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  placeholder="Routing: 123456789, Account: 987654321, Bank Name: Nexa Trust Bank"
                />
                {errors.bankDetails && <p className="mt-1.5 text-xs text-red-500">{errors.bankDetails.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl gradient-btn font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/10 cursor-pointer"
              >
                <span>{submitting ? 'Submitting Application...' : 'Submit Vendor Store application'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorRegister;

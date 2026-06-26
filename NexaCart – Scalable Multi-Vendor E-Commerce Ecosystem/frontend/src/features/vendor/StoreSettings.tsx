import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../core/api/axiosClient';
import PageLoader from '../../core/components/PageLoader';
import { Save, Check, ShieldAlert } from 'lucide-react';

const storeSettingsSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  description: z.string().optional(),
  logoUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  bannerUrl: z.string().url('Must be a valid URL').or(z.literal('')),
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;

const StoreSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema),
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/v1/vendors/my-store');
        if (response.data.success) {
          const store = response.data.data;
          setValue('name', store.name);
          setValue('description', store.description || '');
          setValue('logoUrl', store.logoUrl || '');
          setValue('bannerUrl', store.bannerUrl || '');
        }
      } catch (err: any) {
        setApiError('Failed to fetch store details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [setValue]);

  const onSubmit = async (data: StoreSettingsValues) => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setApiError(null);

      const response = await axiosClient.put('/api/v1/vendors/my-store', {
        name: data.name,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
      });

      if (response.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to update store details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Store Configuration</h2>
        <p className="text-slate-500 text-xs mt-0.5">Customize your brand identity and media displays</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-950/20 border border-green-900 text-green-400 text-sm flex items-center space-x-2">
          <Check size={18} />
          <span>Store configuration updated successfully!</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900 text-red-400 text-sm flex items-center space-x-2">
          <ShieldAlert size={18} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-6 sm:p-8 border border-slate-800 rounded-3xl space-y-6">
        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Store Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
            placeholder="e.g. Acme Tech Store"
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
            placeholder="Introduce your store to customers..."
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Logo URL
          </label>
          <input
            type="text"
            {...register('logoUrl')}
            className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
            placeholder="https://example.com/logo.png"
          />
          {errors.logoUrl && <p className="mt-1.5 text-xs text-red-500">{errors.logoUrl.message}</p>}
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Banner URL
          </label>
          <input
            type="text"
            {...register('bannerUrl')}
            className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
            placeholder="https://example.com/banner.png"
          />
          {errors.bannerUrl && <p className="mt-1.5 text-xs text-red-500">{errors.bannerUrl.message}</p>}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg gradient-btn font-semibold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;

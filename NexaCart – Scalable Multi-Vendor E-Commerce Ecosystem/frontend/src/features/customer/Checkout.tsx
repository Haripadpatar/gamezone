import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../../core/hooks/useCart';
import axiosClient from '../../core/api/axiosClient';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const checkoutSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  couponCode: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'United States',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setSubmitting(true);
      setApiError(null);

      // Create order via backend API
      const response = await axiosClient.post('/api/v1/orders', {
        newShippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        couponCode: data.couponCode || null,
      });

      if (response.data.success) {
        const order = response.data.data;
        // Clear the Redux cart state locally
        clearCart();
        // Redirect to verification portal
        navigate(`/payment-verify?orderNumber=${order.orderNumber}&amount=${order.totalPrice}`);
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to place order. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4">
        <ShoppingBag className="text-slate-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">No items to checkout</h2>
        <button onClick={() => navigate('/products')} className="px-6 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-semibold text-sm">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">Secure Checkout</h1>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/45 border border-red-800 text-red-400 text-sm text-center">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="font-bold text-lg text-white">Shipping Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      {...register('street')}
                      className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="123 Main St"
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                      placeholder="New York"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      State / Province
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                      placeholder="NY"
                    />
                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Zip / Postal Code
                    </label>
                    <input
                      type="text"
                      {...register('zipCode')}
                      className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode.message}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      {...register('country')}
                      className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                      placeholder="United States"
                    />
                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              {/* Coupon section */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-lg text-white mb-4">Promotional Discount</h3>
                <div className="max-w-md">
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    {...register('couponCode')}
                    placeholder="e.g. WELCOME10"
                    className="w-full bg-[#0e1423] text-sm text-slate-350 px-4 py-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 rounded-xl gradient-btn font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-650/10 cursor-pointer"
                >
                  <span>{submitting ? 'Creating Order...' : 'Place Order & Pay'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Checkout Items Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="font-bold text-lg text-white border-b border-slate-850 pb-4">Items Summary</h3>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm gap-2">
                    <div className="truncate pr-4">
                      <p className="font-semibold text-slate-200 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Qty: {item.quantity} &bull; {item.size ? `Size: ${item.size}` : 'Standard'}
                      </p>
                    </div>
                    <span className="font-bold text-white flex-shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery</span>
                  <span className="text-green-400 font-semibold">FREE</span>
                </div>
                <div className="border-t border-slate-850 pt-4 flex justify-between text-base font-extrabold text-white">
                  <span>Total Due</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-500 justify-center">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span>Encrypted checkout processed immediately</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

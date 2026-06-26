import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { CreditCard, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get('orderNumber') || '';
  const amount = searchParams.get('amount') || '0.00';

  const [transactionId, setTransactionId] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [signature, setSignature] = useState(`SIG-${Math.floor(100000 + Math.random() * 900000)}`);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !transactionId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.post('/api/v1/payments/verify', {
        orderNumber,
        transactionId,
        signature,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10 text-center">
        {success ? (
          <div className="space-y-6">
            <div className="h-16 w-16 bg-green-950/80 text-green-400 border border-green-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Payment Successful!</h2>
            <p className="text-slate-400 text-sm">
              Your order <span className="font-semibold text-white">{orderNumber}</span> has been paid and is being processed.
            </p>
            <p className="text-xs text-slate-500">Redirecting to order history...</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors cursor-pointer"
            >
              Go to Orders Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="h-12 w-12 bg-indigo-950/80 text-indigo-400 border border-indigo-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Simulate Payment</h2>
              <p className="text-slate-400 text-xs">Simulate your payment transaction validation securely.</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/45 border border-red-800 text-red-400 text-xs flex items-center justify-center space-x-2">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-[#0e1423] border border-slate-850 rounded-xl space-y-2 text-left">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Order Reference:</span>
                <span className="font-bold text-white">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Amount Due:</span>
                <span className="font-extrabold text-indigo-400">${parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Transaction ID (Simulated)
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Security Signature (Simulated)
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-btn font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/10 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Verify Simulated Transaction'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center space-x-1.5 justify-center text-[10px] text-slate-500">
              <ShieldCheck size={12} className="text-indigo-400" />
              <span>Simulated payment test environment</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;

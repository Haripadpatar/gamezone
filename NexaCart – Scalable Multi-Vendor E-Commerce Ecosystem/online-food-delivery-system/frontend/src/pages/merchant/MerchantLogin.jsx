import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff, ShieldCheck, Flame } from 'lucide-react';

const MerchantLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Please enter both phone number and password");
      return;
    }

    setLoading(true);
    try {
      const userData = await login(phone, password);
      if (userData.role === 'MERCHANT' || userData.role === 'ADMIN') {
        toast.success(`Welcome back, ${userData.name}!`);
        navigate('/merchant/dashboard');
      } else {
        toast.error("Access Denied: Not a merchant account");
      }
    } catch (err) {
      toast.error(err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="w-full max-w-[450px] bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20 shadow-lg shadow-rose-950/20">
            <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">Merchant Partner Portal</h1>
            <p className="text-slate-400 text-xs mt-1">Manage orders, products, and track deliveries</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          
          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-rose-950/20 hover:shadow-rose-950/40 transition-all border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-40"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>Sign In to Portal</>
            )}
          </button>

        </form>

        {/* Footer info links */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <Link to="/" className="hover:text-rose-400 transition-colors">← Back to Shop</Link>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secured Partner Authentication
          </div>
        </div>

      </div>

    </div>
  );
};

export default MerchantLogin;

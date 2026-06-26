import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Lock, Phone, ArrowRight, ShieldCheck, 
  Eye, EyeOff, Paintbrush, Settings, Maximize2, Package 
} from 'lucide-react';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      toast.error('Please enter both phone and password');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await login(phone.trim(), password.trim());
      toast.success(`Welcome back, ${userData.name}!`);
      
      // Redirect to Admin Dashboard if admin, else home
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090514] overflow-hidden relative px-4 py-12">
      {/* Background neon ambient glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-indigo-950/5 blur-[150px] pointer-events-none"></div>
      
      {/* Neon light slashes */}
      <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/15 to-transparent -rotate-12 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/15 to-transparent -rotate-12 pointer-events-none"></div>

      {/* Floating Decorative Elements (Card Corners/Edges) */}
      <div className="relative w-full max-w-[480px]">
        {/* Top-Left Edit/Brush Icon */}
        <div className="absolute -left-8 -top-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-800/10 to-indigo-950/60 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.25)] hidden sm:flex items-center justify-center z-20 hover:scale-105 transition-transform duration-300">
          <Paintbrush className="w-7 h-7 text-purple-450" />
        </div>

        {/* Right-Top Gear Icon */}
        <div className="absolute -right-8 top-[18%] w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/20 via-indigo-800/10 to-slate-950/60 border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.25)] hidden sm:flex items-center justify-center z-20 hover:scale-105 transition-transform duration-300">
          <Settings className="w-7 h-7 text-indigo-400 animate-[spin_20s_linear_infinite]" />
        </div>

        {/* Left-Bottom Expand Icon */}
        <div className="absolute -left-10 bottom-[22%] w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-800/10 to-slate-950/60 border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.25)] hidden sm:flex items-center justify-center z-20 hover:scale-105 transition-transform duration-300">
          <Maximize2 className="w-7 h-7 text-blue-400" />
        </div>

        {/* Right-Bottom Box Icon */}
        <div className="absolute -right-8 bottom-[8%] w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600/20 via-cyan-800/10 to-slate-950/60 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] hidden sm:flex items-center justify-center z-20 hover:scale-105 transition-transform duration-300">
          <Package className="w-7 h-7 text-cyan-400" />
        </div>

        {/* The Card Container */}
        <div className="w-full bg-[#0c091a]/85 backdrop-blur-xl border border-indigo-950/80 rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
          
          {/* Internal gradient lighting decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Logo / Header */}
          <div className="flex flex-col items-center gap-2 text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#150f24] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] mb-3">
              <ShieldCheck className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide">Merchant Portal</h2>
            <p className="text-sm text-slate-400">
              Sign in to manage your <span className="text-rose-500 font-semibold">shop</span>, <span className="text-rose-500 font-semibold font-medium">inventory</span>, and <span className="text-rose-500 font-semibold font-medium">orders</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10 text-left">
            
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter mobile number"
                  className="w-full bg-[#0a0716]/90 border border-indigo-950/60 focus:border-purple-500/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all duration-300"
                />
                <Phone className="absolute left-4 top-4.5 w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0a0716]/90 border border-indigo-950/60 focus:border-purple-500/80 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all duration-300"
                />
                <Lock className="absolute left-4 top-4.5 w-5 h-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:brightness-110 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] border border-pink-400/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center my-1">
              <div className="w-full border-t border-slate-800/60"></div>
              <span className="px-3 text-xs text-slate-500 whitespace-nowrap">or continue with</span>
              <div className="w-full border-t border-slate-800/60"></div>
            </div>

            {/* Third-party Sign In */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => toast.error('Google Sign-in is currently unavailable for merchant accounts')}
                className="flex items-center justify-center gap-2 bg-[#090615]/80 hover:bg-[#120d2b]/80 border border-indigo-950/60 hover:border-indigo-850/80 rounded-2xl py-3 px-3 text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => toast.error('Apple Sign-in is currently unavailable for merchant accounts')}
                className="flex items-center justify-center gap-2 bg-[#090615]/80 hover:bg-[#120d2b]/80 border border-indigo-950/60 hover:border-indigo-850/80 rounded-2xl py-3 px-3 text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                </svg>
                <span className="truncate">Continue with Apple</span>
              </button>
            </div>

            {/* Registration message */}
            <div className="text-center text-xs text-slate-500 mt-2">
              Not a member?{' '}
              <span
                onClick={() => toast.error('Please contact system administrator to register new merchant/admin accounts.')}
                className="text-rose-500 hover:text-rose-450 hover:underline font-semibold cursor-pointer transition-colors"
              >
                Register
              </span>
            </div>

            {/* Helper details for developer testing */}
            <div className="mt-4 border-t border-slate-900/60 pt-4 flex flex-col gap-1 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Default Admin Account</span>
              <p className="text-xs text-slate-500">
                Phone: <strong className="text-indigo-400 font-semibold">9999999999</strong> &nbsp;|&nbsp; Password: <strong className="text-indigo-400 font-semibold">admin123</strong>
              </p>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/hooks/useAuth';
import { KeyRound, Mail, Phone } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { registerUser, loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
    } catch (err) {
      // Error handled by hook state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#090d16] relative overflow-hidden py-12">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Nexa<span className="text-indigo-500">Cart</span>
          </h1>
          <p className="text-slate-400 text-sm">Create an account to browse and shop.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-800/80 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Phone size={18} />
              </span>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <KeyRound size={18} />
              </span>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg gradient-btn font-semibold flex items-center justify-center mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

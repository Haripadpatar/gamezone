import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/hooks/useAuth';
import { Mail, Shield, Phone, ArrowLeft } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-extrabold text-white mb-8">My Account Details</h1>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-850">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl">
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-900/50">
                {user?.role.replace('ROLE_', '')} Account
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3.5 text-slate-350 text-sm">
              <Mail size={16} className="text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 text-slate-350 text-sm">
              <Phone size={16} className="text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-white font-semibold">{user?.phone || 'Not configured'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 text-slate-350 text-sm">
              <Shield size={16} className="text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">System Role Authority</p>
                <p className="text-white font-semibold">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-900/40 text-slate-400 text-xs leading-normal">
            Your login authentication credentials and access tokens are managed using HttpOnly security protocols, preventing client-side data leaks.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

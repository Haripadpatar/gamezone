import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/hooks/useAuth';
import { ClipboardList, Heart, ShoppingBag, Store, User } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Welcome */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5 text-center sm:text-left flex-col sm:flex-row gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-extrabold text-2xl">
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.firstName}!</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage your orders, wishlist, and marketplace profile.</p>
            </div>
          </div>
          <div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-900 uppercase">
              Customer Account
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link
            to="/orders"
            className="p-6 bg-[#0c1222]/65 border border-slate-850 rounded-2xl flex items-start space-x-4 hover:border-indigo-550/40 hover:bg-slate-850/20 transition-all"
          >
            <div className="p-3 bg-indigo-950 text-indigo-450 border border-indigo-900/60 rounded-xl">
              <ClipboardList size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">My Orders</h3>
              <p className="text-slate-500 text-xs leading-normal">Track your orders, view receipts, and cancel pending orders.</p>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="p-6 bg-[#0c1222]/65 border border-slate-850 rounded-2xl flex items-start space-x-4 hover:border-indigo-555/40 hover:bg-slate-850/20 transition-all"
          >
            <div className="p-3 bg-indigo-950 text-indigo-455 border border-indigo-900/60 rounded-xl">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">My Wishlist</h3>
              <p className="text-slate-500 text-xs leading-normal">Browse through products you saved to purchase later.</p>
            </div>
          </Link>

          <Link
            to="/cart"
            className="p-6 bg-[#0c1222]/65 border border-slate-850 rounded-2xl flex items-start space-x-4 hover:border-indigo-555/40 hover:bg-slate-850/20 transition-all"
          >
            <div className="p-3 bg-indigo-950 text-indigo-455 border border-indigo-900/60 rounded-xl">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Shopping Basket</h3>
              <p className="text-slate-500 text-xs leading-normal">Inspect selected product items in your checkout cart.</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="p-6 bg-[#0c1222]/65 border border-slate-850 rounded-2xl flex items-start space-x-4 hover:border-indigo-555/40 hover:bg-slate-850/20 transition-all"
          >
            <div className="p-3 bg-indigo-950 text-indigo-455 border border-indigo-900/60 rounded-xl">
              <User size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">My Profile</h3>
              <p className="text-slate-500 text-xs leading-normal">Verify details, emails, password, and registered phone.</p>
            </div>
          </Link>
        </div>

        {/* Sell on NexaCart CTA */}
        {user?.role === 'ROLE_CUSTOMER' && (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0d1527] to-[#121c35] border border-indigo-950 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4 flex-col sm:flex-row text-center sm:text-left gap-2">
              <div className="p-3.5 bg-indigo-600/10 text-indigo-400 border border-indigo-600/25 rounded-2xl mx-auto">
                <Store size={26} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">Sell products on NexaCart</h3>
                <p className="text-slate-450 text-xs mt-1 leading-relaxed max-w-md">
                  Apply for a moderated vendor store. Once approved, upload your inventory, customize your branding, and sell to platform customers.
                </p>
              </div>
            </div>
            <Link
              to="/vendor/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs flex-shrink-0 flex items-center space-x-1.5 transition-all text-white"
            >
              <span>Register Vendor Store</span>
              <Store size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Shield, Menu, X, Flame } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isMerchant } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 px-4 sm:px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 group-hover:bg-rose-500/20 transition-all">
            <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
            FreshCut <span className="text-rose-500">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-rose-500 transition-colors">
            Home
          </Link>
          <Link to="/catalog" className="text-sm font-medium text-slate-300 hover:text-rose-500 transition-colors">
            Catalog
          </Link>
          
          {/* Order Tracking Quick Lookup */}
          <button 
            onClick={() => {
              const num = prompt("Enter Order Number to track (e.g. ORD-12345678):");
              if (num) navigate(`/order-tracking/${num.trim()}`);
            }}
            className="text-sm font-medium text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
          >
            Track Order
          </button>

          {isAdmin() && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors">
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          {isMerchant && isMerchant() && (
            <Link to="/merchant/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors">
              <Shield className="w-4 h-4" />
              Merchant
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2.5 bg-slate-800/50 rounded-xl hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all">
            <ShoppingCart className="w-5 h-5 text-slate-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#0f1115]">
                {Math.round(cartCount)}
              </span>
            )}
          </Link>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-medium">Hello,</p>
                  <p className="text-xs font-bold text-slate-200 max-w-[100px] truncate">{user.name}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-800/30 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all border border-rose-500/30"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/cart" className="relative p-2 bg-slate-800/50 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-slate-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {Math.round(cartCount)}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-slate-400 hover:text-white bg-slate-800/30 rounded-xl"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-4 animate-fadeIn">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-rose-500 py-2">
            Home
          </Link>
          <Link to="/catalog" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-rose-500 py-2">
            Catalog
          </Link>
          <button 
            onClick={() => {
              setIsOpen(false);
              const num = prompt("Enter Order Number to track:");
              if (num) navigate(`/order-tracking/${num.trim()}`);
            }}
            className="text-left text-sm font-medium text-slate-300 hover:text-rose-500 py-2"
          >
            Track Order
          </button>

          {isAdmin() && (
            <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold text-rose-400 hover:text-rose-300 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}

          {isMerchant && isMerchant() && (
            <Link to="/merchant/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold text-rose-400 hover:text-rose-300 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Merchant Portal
            </Link>
          )}

          {user ? (
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-rose-400" />
                <span className="text-sm text-slate-300 font-bold">{user.name}</span>
              </div>
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }} 
                className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              onClick={() => setIsOpen(false)}
              className="text-center text-xs font-bold text-slate-200 bg-rose-600 px-4 py-2.5 rounded-xl"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

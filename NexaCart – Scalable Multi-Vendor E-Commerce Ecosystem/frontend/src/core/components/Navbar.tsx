import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, Menu, X, Search, Store, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../../store';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const cart = useAppSelector((state) => state.cart);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ROLE_ADMIN':
        return '/admin';
      case 'ROLE_VENDOR':
        return '/vendor';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-wider hover:opacity-90 transition-opacity">
              Nexa<span className="text-indigo-500">Cart</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1423] text-sm text-slate-300 pl-4 pr-10 py-2.5 rounded-full border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
            />
            <button type="submit" className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300">
              <Search size={18} />
            </button>
          </form>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/categories" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Categories
            </Link>
            <Link to="/products" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Shop
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-5">
                {/* Wishlist */}
                <Link to="/wishlist" className="relative p-1 text-slate-400 hover:text-white transition-colors">
                  <Heart size={21} />
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-1 text-slate-400 hover:text-white transition-colors">
                  <ShoppingCart size={21} />
                  {cart.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {cart.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg bg-[#0e1423] border border-slate-800 hover:border-slate-700 focus:outline-none transition-all cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 font-medium">
                      {user?.firstName}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0e1423] border border-slate-800 shadow-2xl py-2 z-50 text-slate-300">
                      <div className="px-4 py-2 border-b border-slate-800/80">
                        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-900/50">
                          {user?.role.replace('ROLE_', '')}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm hover:bg-slate-800/55 hover:text-white transition-colors"
                      >
                        <Settings size={16} />
                        <span>Control Panel</span>
                      </Link>

                      {user?.role === 'ROLE_CUSTOMER' && (
                        <Link
                          to="/vendor/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm hover:bg-slate-800/55 hover:text-white transition-colors"
                        >
                          <Store size={16} />
                          <span>Sell on NexaCart</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 border-t border-slate-800/80 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3.5">
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-semibold px-4.5 py-2.5 rounded-full bg-indigo-650 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-600/20">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <Link to="/cart" className="relative p-1 text-slate-400">
                <ShoppingCart size={22} />
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                    {cart.items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1423] border-b border-slate-800 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-sm text-slate-300 pl-4 pr-10 py-2 rounded-lg border border-slate-800 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-500">
              <Search size={16} />
            </button>
          </form>

          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-2 text-base font-medium"
          >
            Categories
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-2 text-base font-medium"
          >
            Shop
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase px-2">Account: {user?.firstName}</p>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-2 px-2 text-base font-medium rounded-lg hover:bg-slate-800"
              >
                Dashboard Panel
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-2 px-2 text-base font-medium rounded-lg hover:bg-slate-800"
              >
                Wishlist
              </Link>
              {user?.role === 'ROLE_CUSTOMER' && (
                <Link
                  to="/vendor/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-300 hover:text-white py-2 px-2 text-base font-medium rounded-lg hover:bg-slate-800"
                >
                  Sell on NexaCart
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full text-left text-red-400 hover:text-red-300 py-2 px-2 text-base font-medium border-t border-slate-800 mt-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-slate-300 font-medium hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-indigo-650 font-medium text-white hover:bg-indigo-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

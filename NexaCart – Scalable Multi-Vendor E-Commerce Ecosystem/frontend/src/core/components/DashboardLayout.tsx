import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Store,
  BarChart3,
  UserCheck,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_VENDOR')) {
    return null;
  }

  const isAdmin = user.role === 'ROLE_ADMIN';

  const menuItems = isAdmin
    ? [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Vendor Approval', path: '/admin/vendors', icon: UserCheck },
        { name: 'User Control', path: '/admin/users', icon: Users },
        { name: 'Product Moderation', path: '/admin/products', icon: ShieldAlert },
        { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
      ]
    : [
        { name: 'Overview', path: '/vendor', icon: LayoutDashboard },
        { name: 'Product Management', path: '/vendor/products', icon: ShoppingBag },
        { name: 'Inventory Details', path: '/vendor/inventory', icon: Boxes },
        { name: 'Store Orders', path: '/vendor/orders', icon: ClipboardList },
        { name: 'Store Front Config', path: '/vendor/settings', icon: Store },
        { name: 'Store Analytics', path: '/vendor/analytics', icon: BarChart3 },
      ];

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0c1222] border-r border-slate-800/80">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Link to="/" className="text-xl font-bold tracking-wider">
            Nexa<span className="text-indigo-500">Cart</span>
          </Link>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-950 text-indigo-400 border border-indigo-900">
            {isAdmin ? 'Admin' : 'Vendor'}
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
          >
            <Home size={18} />
            <span>Go to Shop</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0c1222] border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {menuItems.find((i) => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                {user.firstName[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#090d16]/80 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c1222] border-r border-slate-850 flex flex-col transition-transform duration-300 transform md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-wider">NexaCart</span>
            <span className="ml-2 px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-indigo-950 text-indigo-400 border border-indigo-900">
              {isAdmin ? 'Admin' : 'Vendor'}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-650 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-850 space-y-2">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-white transition-colors"
          >
            <Home size={18} />
            <span>Go to Shop</span>
          </Link>
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DashboardLayout;

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BarChart3, ShoppingBag, PlusCircle, Home } from 'lucide-react';

const MerchantNav = () => {
  const links = [
    { to: "/merchant/dashboard", label: "Dashboard Analytics", icon: BarChart3 },
    { to: "/merchant/products", label: "Product Catalog", icon: PlusCircle },
  ];

  return (
    <div className="w-full flex flex-col gap-4 border-b border-slate-900 pb-2">
      
      {/* Top title bar */}
      <div className="flex justify-between items-center px-2">
        <div className="text-left">
          <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Store Merchant Portal</span>
          <h2 className="text-xl font-black text-white">Merchant Administration</h2>
        </div>
        <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" /> Back to Shop
        </Link>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          );
        })}
      </div>

    </div>
  );
};

export default MerchantNav;

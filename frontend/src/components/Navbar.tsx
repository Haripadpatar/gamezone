import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LogOut, Wallet, Menu, ChevronDown, Award, Bell, ShieldCheck, Trash2 } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    user, 
    balanceMode, 
    setBalanceMode, 
    mainBalance,
    bonusBalance, 
    practiceBalance, 
    setShowAuthModal, 
    setAuthTab, 
    setShowWalletModal, 
    setWalletTab,
    setShowProfileModal,
    notifications,
    readNotification,
    clearNotifications,
    logout 
  } = useGame();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const realBalance = mainBalance + bonusBalance;
  const activeBalance = balanceMode === 'REAL' ? realBalance : practiceBalance;
  
  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-950/80 backdrop-blur-md border-b border-b-dark-700/60 px-4 md:px-6 py-3 flex items-center justify-between">
      
      {/* Brand & Drawer Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>

        <a href="/" className="flex items-center gap-2 font-black tracking-widest text-lg md:text-xl text-white select-none">
          <span className="h-7 w-7 rounded-xl bg-cyber-gradient flex items-center justify-center text-[10px] text-white shadow-neon-purple-glow font-black">
            AGX
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-neon-cyan text-glow-cyan">
            AGX
          </span>
        </a>
      </div>

      {/* Wallet Controls & User Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {user ? (
          <>
            {/* Balance Mode Switcher */}
            <div className="flex items-center bg-dark-900 border border-dark-700 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBalanceMode('PRACTICE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  balanceMode === 'PRACTICE' 
                    ? 'bg-dark-700 text-neon-cyan shadow-sm shadow-black/40' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => setBalanceMode('REAL')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  balanceMode === 'REAL' 
                    ? 'bg-neon-cyan text-black font-black' 
                    : 'text-gray-450 hover:text-gray-200'
                }`}
              >
                Real
              </button>
            </div>

            {/* Wallet Info Display */}
            <div 
              onClick={() => { setShowWalletModal(true); setWalletTab('history'); }}
              className="flex items-center gap-2 bg-dark-900 hover:bg-dark-800 border border-dark-700 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
            >
              <Wallet size={14} className={balanceMode === 'REAL' ? 'text-neon-cyan' : 'text-neon-purple'} />
              <span className={`text-xs md:text-sm font-extrabold ${balanceMode === 'REAL' ? 'text-neon-emerald' : 'text-neon-cyan'}`}>
                ${activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Deposit Button */}
            <button
              onClick={() => { setShowWalletModal(true); setWalletTab('deposit'); }}
              className="px-3.5 py-1.5 bg-cyber-gradient text-white text-xs font-black rounded-xl hover:opacity-90 shadow-lg shadow-neon-purple/20 transition-all hidden sm:block uppercase tracking-wider"
            >
              Deposit
            </button>

            {/* Notifications Bell Icon */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-xl transition-colors focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-neon-pink rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-neon-pink">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification drop panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-xl glass-panel-glow border border-dark-700 p-3 shadow-2xl z-50 animate-scale-up flex flex-col max-h-96">
                  <div className="flex justify-between items-center border-b border-dark-750 pb-2 mb-2">
                    <h3 className="text-xs font-black text-white">Notifications Center</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-neon-pink font-bold flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={10} /> Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto space-y-2 flex-1 scroll-smooth">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-[10px] text-gray-550 italic">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => readNotification(notif.id)}
                          className={`p-2.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                            notif.read 
                              ? 'bg-dark-900/40 border-dark-800 text-gray-450' 
                              : 'bg-neon-cyan/5 border-neon-cyan/25 text-white font-semibold'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold truncate pr-2">{notif.title}</span>
                            {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shrink-0 mt-1" />}
                          </div>
                          <p className="text-[9px] text-gray-400 leading-normal">{notif.desc}</p>
                          <span className="text-[8px] text-gray-600 block mt-1.5">{notif.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-dark-700 transition-colors focus:outline-none"
              >
                <img 
                  src={user.avatarUrl} 
                  alt="avatar" 
                  className="h-7 w-7 rounded-lg border border-dark-600 bg-dark-900" 
                />
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-xl glass-panel-glow border border-dark-700 p-2 shadow-2xl z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-dark-750">
                    <div className="text-sm font-extrabold text-white truncate">{user.username}</div>
                    <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        user.vipTier === 'DIAMOND' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' :
                        user.vipTier === 'PLATINUM' ? 'bg-purple-950 text-purple-450 border border-purple-500/20' :
                        user.vipTier === 'GOLD' ? 'bg-amber-950 text-gold border border-gold-dark/20' :
                        user.vipTier === 'SILVER' ? 'bg-slate-800 text-slate-350' : 'bg-orange-950 text-orange-450'
                      }`}>
                        VIP {user.vipTier}
                      </span>
                      {user.role === 'ADMIN' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-950 text-red-400 border border-red-500/20 uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg transition-colors text-left"
                    >
                      <ShieldCheck size={14} /> Profile Center
                    </button>
                    <a 
                      href="/#vip" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg transition-colors"
                    >
                      <Award size={14} /> VIP Rewards Program
                    </a>
                    <button
                      onClick={() => { setShowWalletModal(true); setWalletTab('history'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg transition-colors text-left"
                    >
                      <Wallet size={14} /> Transaction History
                    </button>
                  </div>

                  <div className="border-t border-dark-750 pt-1 mt-1">
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
              className="px-3.5 py-1.5 text-xs font-extrabold text-gray-305 hover:text-white hover:bg-dark-750 rounded-xl transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab('register'); setShowAuthModal(true); }}
              className="px-4 py-1.5 bg-neon-cyan text-black text-xs font-black rounded-xl hover:opacity-90 shadow-lg shadow-neon-cyan/20 transition-all uppercase tracking-wider"
            >
              Join Now
            </button>
          </>
        )}
      </div>
    </header>
  );
};

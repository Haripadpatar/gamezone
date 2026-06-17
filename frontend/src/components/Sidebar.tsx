import React from 'react';
import { useGame } from '../context/GameContext';
import { AdsSystem } from './AdsSystem';
import { 
  Home, 
  Trophy, 
  Crown, 
  Users, 
  Gamepad2, 
  Bomb, 
  Flame, 
  RotateCcw, 
  CircleDot, 
  Coins, 
  Dice5, 
  Dices, 
  HelpCircle,
  ShieldCheck,
  Award,
  Download,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { user } = useGame();

  const primaryLinks = [
    { id: 'home', label: 'Lobby', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'vip', label: 'VIP Lounge', icon: Crown },
    { id: 'referral', label: 'Referrals', icon: Users },
    { id: 'tournaments', label: 'Tournaments', icon: Award },
    { id: 'provably', label: 'Provably Fair', icon: ShieldCheck },
  ];

  const gamesLinks = [
    { id: 'mines', label: 'Mines', icon: Bomb, color: 'text-orange-500' },
    { id: 'crash', label: 'Crash Rocket', icon: Flame, color: 'text-neon-pink' },
    { id: 'slots', label: 'Golden Slots', icon: Coins, color: 'text-neon-gold' },
    { id: 'roulette', label: 'Roulette Royale', icon: CircleDot, color: 'text-red-500' },
    { id: 'plinko', label: 'Plinko Drop', icon: Gamepad2, color: 'text-neon-cyan' },
    { id: 'wheel', label: 'Wheel Spin', icon: RotateCcw, color: 'text-purple-400' },
    { id: 'dice', label: 'Cyber Dice', icon: Dice5, color: 'text-emerald-450' },
    { id: 'blackjack', label: 'Blackjack', icon: Dices, color: 'text-blue-400' },
    { id: 'color', label: 'Color Match', icon: HelpCircle, color: 'text-pink-500' },
  ];

  const handleLinkClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const navClass = (id: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all select-none
    ${activeTab === id 
      ? 'bg-dark-800 text-white border-l-2 border-neon-cyan shadow-inner' 
      : 'text-gray-400 hover:text-white hover:bg-dark-900/60'
    }
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-950 border-r border-dark-700/60 flex flex-col pt-16
        transform lg:transform-none lg:static lg:z-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg lg:hidden"
        >
          <X size={18} />
        </button>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Play More Games APK Download Banner */}
          <a 
            href="https://www.mediafire.com/file/6srew8w75x1sad5/app-debug.apk/file"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-dark-900/60 border border-neon-cyan/20 hover:border-neon-cyan/40 hover:shadow-neon-cyan-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer group text-left select-none relative overflow-hidden"
          >
            {/* Subtle glow background */}
            <div className="absolute -right-8 -top-8 h-20 w-20 bg-neon-cyan/10 blur-xl rounded-full group-hover:bg-neon-cyan/20 transition-colors duration-300" />
            
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🎮</span>
              <h4 className="text-xs font-black text-white group-hover:text-neon-cyan transition-colors">
                Play More Games
              </h4>
            </div>
            
            <p className="text-[9px] text-gray-400 leading-normal mb-3">
              Download our Android App and enjoy more exclusive games.
            </p>
            
            <div className="flex flex-col gap-2.5">
              {/* Android Indicator */}
              <div className="flex items-center gap-1.5 self-start px-2 py-1 bg-dark-950/80 border border-dark-750 rounded-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-emerald-500">
                  <path d="M17.523 15.3414C17.523 15.8617 17.1006 16.284 16.5804 16.284C16.0601 16.284 15.6377 15.8617 15.6377 15.3414C15.6377 14.8212 16.0601 14.3988 16.5804 14.3988C17.1006 14.3988 17.523 14.8212 17.523 15.3414ZM8.36185 15.3414C8.36185 15.8617 7.93952 16.284 7.41926 16.284C6.899 16.284 6.47667 15.8617 6.47667 15.3414C6.47667 14.8212 6.899 14.3988 7.41926 14.3988C7.93952 14.3988 8.36185 14.8212 8.36185 15.3414ZM17.6599 10.457L19.5222 7.23126C19.6548 7.0016 19.5762 6.7077 19.3465 6.57508C19.1168 6.44246 18.8229 6.52112 18.6903 6.75078L16.7961 10.0319C15.3477 9.3731 13.7317 9.00624 12 9.00624C10.2683 9.00624 8.65227 9.3731 7.20387 10.0319L5.30968 6.75078C5.17706 6.52112 4.88316 6.44246 4.6535 6.57508C4.42384 6.7077 4.34518 7.0016 4.4778 7.23126L6.34013 10.457C2.96918 12.3039 0.702759 15.7061 0.505737 19.6974H23.4943C23.2972 15.7061 21.0308 12.3039 17.6599 10.457Z" />
                </svg>
                <span className="text-[7.5px] text-gray-450 uppercase font-black tracking-wider">Android App</span>
              </div>
              
              {/* CTA Button */}
              <div className="flex items-center justify-center gap-1.5 w-full py-2 bg-cyber-gradient text-white text-[9px] font-black rounded-xl shadow-md group-hover:shadow-neon-cyan/25 transition-all">
                <Download size={11} />
                <span>Download APK</span>
              </div>
            </div>
          </a>

          {/* Main Links */}
          <div className="space-y-1">
            {primaryLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={navClass(link.id)}
              >
                <link.icon size={16} className={activeTab === link.id ? 'text-neon-cyan' : 'text-gray-500'} />
                {link.label}
              </button>
            ))}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleLinkClick('admin')}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all select-none
                  ${activeTab === 'admin' 
                    ? 'bg-red-950/40 text-red-400 border-l-2 border-red-500' 
                    : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/20'
                  }
                `}
              >
                <ShieldCheck size={16} />
                Admin Dashboard
              </button>
            )}
          </div>

          {/* Games Section */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3.5">
              Available Games
            </div>
            <div className="space-y-1">
              {gamesLinks.map(game => (
                <button
                  key={game.id}
                  onClick={() => handleLinkClick(game.id)}
                  className={navClass(game.id)}
                >
                  <game.icon size={16} className={`${game.color} ${activeTab === game.id ? 'animate-pulse' : ''}`} />
                  {game.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sponsored Ad Widget */}
          <div className="pt-2">
            <AdsSystem placement="sidebar" />
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-dark-700/60 bg-dark-900/10 text-center">
          <div className="text-[9px] text-gray-500">Antigravity Gaming Tech</div>
          <div className="text-[8px] text-gray-650 mt-0.5">Secure RNG Certifications</div>
        </div>
      </aside>
    </>
  );
};

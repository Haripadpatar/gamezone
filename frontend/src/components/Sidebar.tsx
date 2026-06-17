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
  X,
  Swords,
  Spade,
  Club,
  BarChart3
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
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const gamesLinks = [
    { id: 'mines', label: 'Mines', icon: Bomb, color: 'text-orange-500' },
    { id: 'crash', label: 'Aviator', icon: Flame, color: 'text-neon-pink' },
    { id: 'slots', label: 'Golden Slots', icon: Coins, color: 'text-neon-gold' },
    { id: 'roulette', label: 'Roulette Royale', icon: CircleDot, color: 'text-red-500' },
    { id: 'plinko', label: 'Plinko Drop', icon: Gamepad2, color: 'text-neon-cyan' },
    { id: 'wheel', label: 'Wheel Spin', icon: RotateCcw, color: 'text-purple-400' },
    { id: 'dice', label: 'Lucky Dice', icon: Dice5, color: 'text-emerald-450' },
    { id: 'blackjack', label: 'Blackjack', icon: Dices, color: 'text-blue-400' },
    { id: 'color', label: 'Color Match', icon: HelpCircle, color: 'text-pink-500' },
    { id: 'dragon_tiger', label: 'Dragon vs Tiger', icon: Swords, color: 'text-red-500' },
    { id: 'teen_patti', label: 'Teen Patti', icon: Spade, color: 'text-neon-gold' },
    { id: 'ludo', label: 'Ludo', icon: Gamepad2, color: 'text-green-400' },
    { id: 'andar_bahar', label: 'Andar Bahar', icon: Dices, color: 'text-neon-pink' },
    { id: 'baccarat', label: 'Baccarat', icon: Club, color: 'text-neon-cyan' },
    { id: 'poker', label: "Poker Texas Hold'em", icon: Club, color: 'text-purple-500' },
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
          <div className="text-[9px] text-gray-500">SpaceH Gaming Technologies</div>
          <div className="text-[8px] text-gray-650 mt-0.5">Secure RNG Certifications</div>
        </div>
      </aside>
    </>
  );
};

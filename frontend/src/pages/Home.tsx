import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AdsSystem } from '../components/AdsSystem';
import { 
  Bomb, 
  Flame, 
  Coins, 
  CircleDot, 
  Gamepad2, 
  RotateCcw, 
  Dice5, 
  Dices, 
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onSelectGame: (gameId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectGame }) => {
  const { recentBets, setShowAuthModal, user } = useGame();
  const [filter, setFilter] = useState<'all' | 'instant' | 'cards' | 'chance'>('all');

  const games = [
    { id: 'mines', title: 'Mines', category: 'instant', icon: Bomb, color: 'from-orange-600 to-amber-500', desc: 'Reveal gems, avoid mines, multiplier increases.', hot: true },
    { id: 'crash', title: 'Crash Rocket', category: 'instant', icon: Flame, color: 'from-neon-pink to-purple-600', desc: 'Predict the rocket crash trajectory.', hot: true },
    { id: 'slots', title: 'Golden Slots', category: 'chance', icon: Coins, color: 'from-neon-gold to-yellow-600', desc: '3-reel fruit machine. Mega paylines.', hot: false },
    { id: 'roulette', title: 'Roulette Royale', category: 'chance', icon: CircleDot, color: 'from-red-650 to-red-500', desc: 'Place bets on numbers, color, or odd/even.', hot: false },
    { id: 'plinko', title: 'Plinko Drop', category: 'instant', icon: Gamepad2, color: 'from-neon-cyan to-blue-600', desc: 'Drop balls through pegs into multipliers.', hot: true },
    { id: 'wheel', title: 'Wheel Spin', category: 'chance', icon: RotateCcw, color: 'from-purple-600 to-indigo-500', desc: 'Spin the wheel of fortune for prizes.', hot: false },
    { id: 'dice', title: 'Cyber Dice', category: 'instant', icon: Dice5, color: 'from-emerald-500 to-teal-600', desc: 'Roll high or low to win. Adjust risk sliders.', hot: false },
    { id: 'blackjack', title: 'Blackjack', category: 'cards', icon: Dices, color: 'from-blue-600 to-slate-550', desc: 'Beat the dealer score without crossing 21.', hot: true },
    { id: 'color', title: 'Color Match', category: 'chance', icon: HelpCircle, color: 'from-pink-600 to-rose-500', desc: 'Predict color trends. 30-sec cycles.', hot: false }
  ];

  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(g => g.category === filter);

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Hero Promo Banner Slider */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950 border border-dark-700/80 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-glass-glow bg-no-repeat bg-cover opacity-50 animate-pulse-slow" />

        <div className="space-y-4 max-w-lg z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-xs font-black text-neon-cyan uppercase tracking-wider animate-pulse">
            <Zap size={12} /> Launching Beta Program
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Next-Gen <span className="bg-clip-text text-transparent bg-cyber-gradient text-glow-purple">Gaming</span> Technology
          </h1>
          <p className="text-xs md:text-sm text-gray-405 leading-relaxed">
            Welcome to Antigravity, the premium digital entertainment hub. Enjoy secure financial transaction gates, real-time analytics, and guaranteed provably fair game algorithms.
          </p>

          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2.5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-xs rounded-xl shadow-lg shadow-neon-cyan/20 transition-all flex items-center gap-2 group uppercase tracking-wider"
            >
              Start Playing Now 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Banner graphics mockup */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 z-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyber-gradient blur-2xl opacity-20 animate-spin-slow" />
          <div className="h-40 w-40 rounded-3xl bg-dark-900 border border-dark-750 flex flex-col items-center justify-center p-4 shadow-2xl relative rotate-6 hover:rotate-0 transition-transform">
            <div className="text-[10px] text-gray-500 font-bold mb-1">PROVABLY</div>
            <div className="text-2xl font-black text-neon-cyan text-glow-cyan mb-2">FAIR</div>
            <ShieldCheck size={48} className="text-neon-cyan animate-pulse" />
            <div className="text-[8px] text-gray-400 mt-2 text-center">Verified RNG Audits</div>
          </div>
        </div>
      </div>

      {/* Sponsor Banner Ad placement */}
      <AdsSystem placement="banner" />

      {/* 2. Game Category Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingUp className="text-neon-cyan" size={20} /> Featured Entertainment
          </h2>
          <p className="text-xs text-gray-400">Select categories to browse or play</p>
        </div>

        <div className="flex bg-dark-900 border border-dark-700/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Games' },
            { id: 'instant', label: 'Instant Games' },
            { id: 'cards', label: 'Card Games' },
            { id: 'chance', label: 'Chance Slots' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 ${
                filter === tab.id 
                  ? 'bg-dark-800 text-white font-extrabold shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Games Grid */}
      <div className="games-grid">
        {filteredGames.map(game => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="group relative rounded-2xl border border-dark-700/50 bg-dark-900/40 p-4 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/35 hover:bg-dark-900/80"
          >
            {/* Glowing background on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60 z-0" />
            
            {/* Hot badge */}
            {game.hot && (
              <span className="absolute top-3 right-3 z-10 inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-neon-pink text-white uppercase tracking-wide shadow-neon-pink">
                Hot
              </span>
            )}

            {/* Icon visual container */}
            <div className={`h-24 rounded-xl bg-gradient-to-br ${game.color} p-4 flex items-center justify-center relative mb-4 z-10 transition-transform duration-500 group-hover:scale-[1.03]`}>
              <game.icon size={36} className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
            </div>

            {/* Game info */}
            <div className="space-y-1 z-10 relative">
              <h3 className="font-bold text-sm text-white group-hover:text-neon-cyan transition-colors">
                {game.title}
              </h3>
              <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                {game.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Live Bets Ticker */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-dark-750 pb-3">
          <div>
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-emerald animate-ping" />
              Live Platform Activities
            </h3>
            <p className="text-[10px] text-gray-500">Real-time update ticker of bets placed globally</p>
          </div>
          <span className="text-[9px] uppercase font-bold text-gray-450 bg-dark-800 px-2 py-0.5 rounded border border-dark-700">
            RNG Encrypted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="text-gray-550 border-b border-dark-750">
                <th className="py-2.5 font-bold">Game</th>
                <th className="py-2.5 font-bold">Player</th>
                <th className="py-2.5 font-bold">Wager Amount</th>
                <th className="py-2.5 font-bold text-center">Multiplier</th>
                <th className="py-2.5 font-bold text-right">Payout ($)</th>
                <th className="py-2.5 font-bold text-right pr-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/30">
              {recentBets.map(bet => (
                <tr key={bet.id} className="hover:bg-dark-900/30 transition-colors animate-fade-in">
                  <td className="py-2 font-bold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-neon-cyan-glow" />
                    {bet.gameType}
                  </td>
                  <td className="py-2 text-gray-300 font-semibold">{bet.username}</td>
                  <td className="py-2 text-gray-450">${bet.betAmount.toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                      bet.multiplier > 0 
                        ? 'bg-emerald-950/40 text-neon-emerald border border-emerald-500/20' 
                        : 'bg-dark-800 text-gray-500'
                    }`}>
                      {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : '-'}
                    </span>
                  </td>
                  <td className={`py-2 text-right font-black ${bet.payout > 0 ? 'text-neon-emerald' : 'text-gray-500'}`}>
                    {bet.payout > 0 ? `+$${bet.payout.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-2 text-right text-[10px] text-gray-500 pr-2">{bet.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Trust Seals and Certification info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dark-750 pt-8">
        {[
          { title: 'Provably Fair RNG', desc: 'SHA-256 cryptographic verification of all roll seeds ensures 100% fair outcomes.', icon: CheckCircle2 },
          { title: 'Audited Payouts', desc: 'Secure client-side simulation matches mathematical gaming distributions.', icon: ShieldCheck },
          { title: 'Instant Withdrawals', desc: 'Automated administrative queue clears payouts safely and quickly.', icon: ShieldAlert }
        ].map((seal, idx) => (
          <div key={idx} className="flex gap-3 items-start p-4 rounded-xl bg-dark-900/20 border border-dark-700/40">
            <seal.icon className="shrink-0 text-neon-cyan" size={20} />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">{seal.title}</h4>
              <p className="text-[10px] text-gray-500 leading-normal">{seal.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

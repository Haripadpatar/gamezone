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
  CheckCircle2,
  Swords,
  Spade,
  Club,
  Download
} from 'lucide-react';

import minesPoster from '../assets/mines.jpg';
import aviatorPoster from '../assets/aviator.jpg';
import goldenSlotsPoster from '../assets/golden_slots.png';
import roulettePoster from '../assets/car_roulette.jpg';
import plinkoPoster from '../assets/plinko.png';
import wheelPoster from '../assets/wheel_spin.jpg';
import luckyDicePoster from '../assets/lucky_dice.png';
import blackjackPoster from '../assets/blackjack.png';
import colorPoster from '../assets/color_prediction.png';
import dragonTigerPoster from '../assets/dragon_tiger.jpg';
import teenPattiPoster from '../assets/teen_patti.png';
import ludoPoster from '../assets/ludo.png';
import andarBaharPoster from '../assets/andar_bahar.png';
import baccaratPoster from '../assets/baccarat.png';
import pokerPoster from '../assets/poker.png';

interface HomeProps {
  onSelectGame: (gameId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectGame }) => {
  const { recentBets, setShowAuthModal, user } = useGame();
  const [filter, setFilter] = useState<'all' | 'instant' | 'cards' | 'chance'>('all');

  const games = [
    { id: 'mines', title: 'Mines', category: 'instant', icon: Bomb, poster: minesPoster, desc: 'Reveal gems, avoid mines, multiplier increases.', hot: true },
    { id: 'crash', title: 'Aviator', category: 'instant', icon: Flame, poster: aviatorPoster, desc: 'Predict the rocket crash trajectory.', hot: true },
    { id: 'slots', title: 'Golden Slots', category: 'chance', icon: Coins, poster: goldenSlotsPoster, desc: '3-reel fruit machine. Mega paylines.', hot: false },
    { id: 'roulette', title: 'Roulette Royale', category: 'chance', icon: CircleDot, poster: roulettePoster, desc: 'Place bets on numbers, color, or odd/even.', hot: false },
    { id: 'plinko', title: 'Plinko Drop', category: 'instant', icon: Gamepad2, poster: plinkoPoster, desc: 'Drop balls through pegs into multipliers.', hot: true },
    { id: 'wheel', title: 'Wheel Spin', category: 'chance', icon: RotateCcw, poster: wheelPoster, desc: 'Spin the wheel of fortune for prizes.', hot: false },
    { id: 'dice', title: 'Lucky Dice', category: 'instant', icon: Dice5, poster: luckyDicePoster, desc: 'Roll high or low to win. Adjust risk sliders.', hot: false },
    { id: 'blackjack', title: 'Blackjack', category: 'cards', icon: Dices, poster: blackjackPoster, desc: 'Beat the dealer score without crossing 21.', hot: true },
    { id: 'color', title: 'Color Match', category: 'chance', icon: HelpCircle, poster: colorPoster, desc: 'Predict color trends. 30-sec cycles.', hot: false },
    { id: 'dragon_tiger', title: 'Dragon vs Tiger', category: 'cards', icon: Swords, poster: dragonTigerPoster, desc: 'Predict high card between Dragon and Tiger.', hot: true },
    { id: 'teen_patti', title: 'Teen Patti', category: 'cards', icon: Spade, poster: teenPattiPoster, desc: 'Indian 3-card poker game. Showdown of hands.', hot: true },
    { id: 'ludo', title: 'Ludo', category: 'chance', icon: Gamepad2, poster: ludoPoster, desc: 'Race your tokens to the center in Ludo Arena.', hot: false },
    { id: 'andar_bahar', title: 'Andar Bahar', category: 'cards', icon: Dices, poster: andarBaharPoster, desc: 'Predict if matching card rank lands inside or outside.', hot: false },
    { id: 'baccarat', title: 'Baccarat', category: 'cards', icon: Club, poster: baccaratPoster, desc: 'Bet on Player, Banker or Tie in this luxury classic.', hot: false },
    { id: 'poker', title: "Poker Texas Hold'em", category: 'cards', icon: Club, poster: pokerPoster, desc: 'Bluff and raise in the ultimate Texas Hold\'em cash tables.', hot: true }
  ];

  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(g => g.category === filter);

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Hero Promo Banner Slider */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950 border border-dark-700/80 p-6 md:p-10 flex flex-col gap-6 md:gap-8 justify-between">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-glass-glow bg-no-repeat bg-cover opacity-50 animate-pulse-slow" />

        {/* APK Promo Widget Pill (Centered on desktop, above heading on mobile) */}
        <div className="z-10 flex justify-center w-full">
          <a 
            href="https://www.mediafire.com/file/6srew8w75x1sad5/app-debug.apk/file"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 md:gap-3 px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-full bg-dark-950/85 border border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-neon-cyan-glow hover:scale-[1.02] transition-all duration-300 group cursor-pointer select-none text-left"
          >
            {/* Android Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 animate-pulse shrink-0">
              <path d="M17.523 15.3414C17.523 15.8617 17.1006 16.284 16.5804 16.284C16.0601 16.284 15.6377 15.8617 15.6377 15.3414C15.6377 14.8212 16.0601 14.3988 16.5804 14.3988C17.1006 14.3988 17.523 14.8212 17.523 15.3414ZM8.36185 15.3414C8.36185 15.8617 7.93952 16.284 7.41926 16.284C6.899 16.284 6.47667 15.8617 6.47667 15.3414C6.47667 14.8212 6.899 14.3988 7.41926 14.3988C7.93952 14.3988 8.36185 14.8212 8.36185 15.3414ZM17.6599 10.457L19.5222 7.23126C19.6548 7.0016 19.5762 6.7077 19.3465 6.57508C19.1168 6.44246 18.8229 6.52112 18.6903 6.75078L16.7961 10.0319C15.3477 9.3731 13.7317 9.00624 12 9.00624C10.2683 9.00624 8.65227 9.3731 7.20387 10.0319L5.30968 6.75078C5.17706 6.52112 4.88316 6.44246 4.6535 6.57508C4.42384 6.7077 4.34518 7.0016 4.4778 7.23126L6.34013 10.457C2.96918 12.3039 0.702759 15.7061 0.505737 19.6974H23.4943C23.2972 15.7061 21.0308 12.3039 17.6599 10.457Z" />
            </svg>
            <span className="text-[10px] md:text-xs font-black text-white group-hover:text-neon-cyan transition-colors tracking-wide shrink-0">
              🎮 Play More Games
            </span>
            <span className="text-[9.5px] text-gray-400 font-semibold hidden md:inline shrink-0">
              | Download our Android App and enjoy more exclusive games
            </span>
            <span className="text-[9px] text-gray-400 font-semibold md:hidden shrink-0">
              | Download App
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyber-gradient text-[8px] md:text-[9.5px] font-black uppercase text-white rounded-full shadow-md group-hover:shadow-neon-cyan/25 transition-all shrink-0">
              <Download size={10} />
              <span>Download APK</span>
            </span>
          </a>
        </div>

        {/* Content rows: flex row on desktop, flex col on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          
          <div className="space-y-4 max-w-lg z-10 text-left w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-xs font-black text-neon-cyan uppercase tracking-wider animate-pulse">
              <Zap size={12} /> Launching Beta Program
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Next-Gen <span className="bg-clip-text text-transparent bg-cyber-gradient text-glow-purple">Gaming</span> Technology
            </h1>
            <p className="text-xs md:text-sm text-gray-405 leading-relaxed">
              Welcome to SpaceH, the next-generation gaming technology platform. Enjoy secure financial transaction gates, real-time analytics, and guaranteed provably fair game algorithms.
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
              <div className="text-[10px] text-gray-550 font-bold mb-1">PROVABLY</div>
              <div className="text-2xl font-black text-neon-cyan text-glow-cyan mb-2">FAIR</div>
              <ShieldCheck size={48} className="text-neon-cyan animate-pulse" />
              <div className="text-[8px] text-gray-450 mt-2 text-center">Verified RNG Audits</div>
            </div>
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
            className="group relative rounded-2xl border border-dark-700/50 bg-dark-900/40 p-3.5 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/45 hover:shadow-neon-cyan-glow hover:bg-dark-900/85"
          >
            {/* Glowing background on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-65 z-0" />
            
            {/* Hot badge */}
            {game.hot && (
              <span className="absolute top-3.5 right-3.5 z-20 inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-neon-pink text-white uppercase tracking-wide shadow-neon-pink">
                Hot
              </span>
            )}

            {/* Poster image container */}
            <div className="relative h-44 rounded-xl overflow-hidden mb-3.5 z-10 border border-dark-750 group-hover:border-neon-cyan/30 transition-all duration-300">
              <img 
                src={game.poster} 
                alt={game.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-90" />
            </div>

            {/* Game info */}
            <div className="space-y-1 z-10 relative px-0.5">
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

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
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Swords,
  Spade,
  Club,
  Download,
  Lock,
  Users,
  MessageSquare
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
  const { recentBets } = useGame();
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
      
      {/* 1. Redesigned Premium Hero Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950 border border-dark-700/80 p-6 md:p-10 flex flex-col gap-6 justify-between">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-glass-glow bg-no-repeat bg-cover opacity-50 animate-pulse-slow pointer-events-none" />

        {/* Content rows: split layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 w-full z-10">
          
          {/* Left: Large APK download card details */}
          <div className="flex-1 space-y-6 max-w-xl text-left">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                RECOMMENDED INSTALL
              </span>
              
              <h2 className="text-3xl md:text-4.5xl font-black text-white leading-tight tracking-tight flex items-center gap-2">
                🎮 Play More Games
              </h2>
              
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                Download the latest Android App and enjoy premium casino games, faster performance, new game modes, and regular updates.
              </p>
            </div>

            {/* Features list checkmark grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
              {[
                { label: 'Latest App Release' },
                { label: 'Daily Rewards' },
                { label: '14+ Premium Games' },
                { label: 'VIP Features' },
                { label: 'Faster Performance' },
                { label: 'Secure Download' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-gray-300">
                  <span className="text-emerald-500 font-black text-sm">✓</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <a 
                href="https://www.mediafire.com/file/0y9mj92k1cuy18t/app-release.apk/file"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-95 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan-glow transition-all duration-300 uppercase tracking-wider w-full sm:w-auto"
              >
                <Download size={16} />
                <span>Download Latest APK</span>
              </a>
            </div>

            {/* Footer version specifications */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] font-bold text-gray-550 uppercase tracking-widest border-t border-dark-800/80 pt-4">
              <span>Version: v1.0.0</span>
              <span className="text-gray-700">•</span>
              <span>Size: 47.46MB</span>
              <span className="text-gray-700">•</span>
              <span>Android 7.0+</span>
            </div>
          </div>

          {/* Right: Phone mockup + Android mascot logo */}
          <div className="relative flex items-center justify-center min-w-[340px] md:min-w-[420px] h-[365px] md:h-[400px]">
            
            {/* 3D-styled CSS mobile phone container */}
            <div className="w-[185px] md:w-[210px] h-[330px] md:h-[380px] bg-dark-950 border-[5px] border-dark-800 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col justify-between p-2.5 z-10 hover:border-dark-750 transition-colors">
              
              {/* Speaker Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-dark-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-6 h-[1px] bg-dark-900 rounded-full" />
              </div>

              {/* Mock App Screen Content */}
              <div className="flex-1 flex flex-col justify-between pt-3">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-dark-900 pb-1">
                  <span className="text-[7.5px] font-black text-white tracking-tighter">AGX</span>
                  <span className="text-[5.5px] text-gray-550 font-bold uppercase tracking-widest">by SpaceH</span>
                </div>

                {/* Balance Widget */}
                <div className="bg-dark-900/90 border border-dark-800 rounded-lg p-1.5 mt-1.5 space-y-0.5 text-left">
                  <span className="text-[5px] text-gray-550 font-black uppercase tracking-wider block">Total Balance</span>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[9px] font-black text-white font-mono">₹18,750.50</span>
                    <button className="px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[5px] font-black text-emerald-450 rounded uppercase tracking-wider">
                      + Add Cash
                    </button>
                  </div>
                </div>

                {/* Top Games Section */}
                <div className="mt-1.5 flex-1 flex flex-col justify-start">
                  <span className="text-[6.5px] text-gray-500 font-black uppercase tracking-widest block text-left mb-1">Top Games</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { name: 'Aviator', color: 'bg-red-500/10 border-red-500/20 text-red-400', icon: Flame },
                      { name: 'Mines', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400', icon: Bomb },
                      { name: 'Roulette', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', icon: CircleDot },
                      { name: 'Plinko', color: 'bg-neon-pink/10 border-neon-pink/20 text-neon-pink', icon: Gamepad2 },
                      { name: 'Dragon Tiger', color: 'bg-red-500/10 border-red-500/20 text-red-400', icon: Swords },
                      { name: 'Blackjack', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: Dices },
                      { name: 'Teen Patti', color: 'bg-neon-gold/10 border-neon-gold/20 text-neon-gold', icon: Spade },
                      { name: 'Ludo', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450', icon: Gamepad2 },
                      { name: 'Andar Bahar', color: 'bg-neon-pink/10 border-neon-pink/20 text-neon-pink', icon: Dices }
                    ].map((game, gIdx) => (
                      <div key={gIdx} className="bg-dark-900 border border-dark-850 rounded p-1 flex flex-col items-center justify-center space-y-0.5">
                        <div className={`p-0.5 rounded border ${game.color}`}>
                          <game.icon size={8} />
                        </div>
                        <span className="text-[5.5px] font-black text-gray-300 truncate w-full text-center tracking-tight leading-none uppercase">{game.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="flex justify-between items-center border-t border-dark-900 pt-1 mt-2.5">
                  {[
                    { label: 'Home', active: true },
                    { label: 'Games', active: false },
                    { label: 'Wallet', active: false },
                    { label: 'Rewards', active: false },
                    { label: 'Profile', active: false }
                  ].map((nav, nIdx) => (
                    <span key={nIdx} className={`text-[5px] font-black uppercase tracking-wider ${nav.active ? 'text-neon-cyan' : 'text-gray-550'}`}>
                      {nav.label}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Glowing Mascot Container */}
            <div className="absolute right-2 md:right-4 flex flex-col items-center space-y-2 z-0">
              
              {/* Mascot badge panel */}
              <div className="relative w-18 h-18 md:w-22 md:h-22 rounded-2xl bg-dark-900 border border-neon-gold/15 flex flex-col items-center justify-center shadow-lg shadow-neon-purple/10 hover:border-neon-gold/40 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 md:w-12 md:h-12 text-emerald-450 drop-shadow-[0_0_4px_rgba(16,185,129,0.45)]">
                  <path d="M17.523 15.3414C17.523 15.8617 17.1006 16.284 16.5804 16.284C16.0601 16.284 15.6377 15.8617 15.6377 15.3414C15.6377 14.8212 16.0601 14.3988 16.5804 14.3988C17.1006 14.3988 17.523 14.8212 17.523 15.3414ZM8.36185 15.3414C8.36185 15.8617 7.93952 16.284 7.41926 16.284C6.899 16.284 6.47667 15.8617 6.47667 15.3414C6.47667 14.8212 6.899 14.3988 7.41926 14.3988C7.93952 14.3988 8.36185 14.8212 8.36185 15.3414ZM17.6599 10.457L19.5222 7.23126C19.6548 7.0016 19.5762 6.7077 19.3465 6.57508C19.1168 6.44246 18.8229 6.52112 18.6903 6.75078L16.7961 10.0319C15.3477 9.3731 13.7317 9.00624 12 9.00624C10.2683 9.00624 8.65227 9.3731 7.20387 10.0319L5.30968 6.75078C5.17706 6.52112 4.88316 6.44246 4.6535 6.57508C4.42384 6.7077 4.34518 7.0016 4.4778 7.23126L6.34013 10.457C2.96918 12.3039 0.702759 15.7061 0.505737 19.6974H23.4943C23.2972 15.7061 21.0308 12.3039 17.6599 10.457Z" fill="currentColor" />
                </svg>
                {/* Arrow pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Glowing rings */}
              <div className="relative w-24 h-7 mt-2 flex items-center justify-center">
                <div className="absolute w-20 h-5 border-2 border-neon-purple rounded-full opacity-40 blur-xs scale-y-[0.35] animate-pulse" />
                <div className="absolute w-16 h-3 border border-neon-cyan rounded-full opacity-60 blur-xs scale-y-[0.3] animate-pulse-slow" />
                <span className="text-[9px] font-black text-neon-cyan text-glow-cyan uppercase tracking-widest z-10 pt-0.5">AGX APP</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Glass Trust Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full z-10">
        
        {/* Card 1: Bank-Level Security */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 flex items-center gap-3.5 hover:border-neon-cyan/35 hover:shadow-neon-cyan-glow transition-all duration-300">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-xl">
            <Lock size={18} />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-black text-white">Bank-Level Security</h4>
            <p className="text-[9.5px] text-gray-400 font-bold">100% Secure & encrypted</p>
          </div>
        </div>

        {/* Card 2: Provably Fair Games */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 flex items-center gap-3.5 hover:border-neon-purple/35 hover:shadow-neon-purple-glow transition-all duration-300">
          <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 text-neon-purple rounded-xl">
            <ShieldCheck size={18} />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-black text-white">Provably Fair Games</h4>
            <p className="text-[9.5px] text-gray-400 font-bold">Verified fair play outcomes</p>
          </div>
        </div>

        {/* Card 3: 24/7 Live Support */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 flex items-center gap-3.5 hover:border-neon-pink/35 hover:shadow-neon-pink-glow transition-all duration-300">
          <div className="p-3 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink rounded-xl">
            <MessageSquare size={18} />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-black text-white">24/7 Live Support</h4>
            <p className="text-[9.5px] text-gray-400 font-bold">Dedicated player assistance</p>
          </div>
        </div>

        {/* Card 4: 1M+ Players */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 flex items-center gap-3.5 hover:border-neon-gold/35 hover:shadow-neon-gold-glow transition-all duration-300">
          <div className="p-3 bg-neon-gold/10 border border-neon-gold/20 text-neon-gold rounded-xl">
            <Users size={18} />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-black text-white">1M+ Players</h4>
            <p className="text-[9.5px] text-gray-400 font-bold">Trusted global community</p>
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
              <p className="text-[10px] text-gray-550 leading-normal">{seal.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Portfolio Showcase Footer */}
      <footer className="border-t border-dark-750/80 pt-8 mt-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-dark-800">
          <div className="space-y-1.5 text-left">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
              AGX by SpaceH
            </h4>
            <p className="text-[10px] text-gray-500 leading-normal max-w-sm">
              SpaceH is an advanced digital gaming ecosystem built for high-performance and cryptographically secured provably fair RNG games.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-black">
            <a 
              href="https://github.com/haripadpatar/gamezone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-cyan transition-colors"
            >
              GitHub Repository
            </a>
            <span className="text-gray-700">|</span>
            <a 
              href="https://www.mediafire.com/file/0y9mj92k1cuy18t/app-release.apk/file"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-cyan transition-colors"
            >
              Download Android App
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase font-black text-gray-550 tracking-wider">Built With:</span>
            {[
              { name: 'React', color: 'bg-blue-950/45 text-blue-405 border-blue-800/20' },
              { name: 'TypeScript', color: 'bg-indigo-950/45 text-indigo-405 border-indigo-800/20' },
              { name: 'Spring Boot', color: 'bg-emerald-950/45 text-emerald-450 border-emerald-800/20' },
              { name: 'PostgreSQL', color: 'bg-cyan-950/45 text-cyan-405 border-cyan-800/20' },
              { name: 'Redis', color: 'bg-rose-950/45 text-rose-405 border-rose-800/20' },
              { name: 'WebSocket', color: 'bg-amber-950/45 text-amber-405 border-amber-800/20' },
              { name: 'Docker', color: 'bg-sky-950/45 text-sky-405 border-sky-800/20' }
            ].map((tech, idx) => (
              <span 
                key={idx} 
                className={`px-2 py-0.5 rounded text-[8.5px] font-black border uppercase tracking-wider ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>
          <div className="text-[9px] text-gray-550 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} SpaceH Gaming. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

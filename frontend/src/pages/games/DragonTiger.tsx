import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Swords, Wallet, Play, Sparkles } from 'lucide-react';
import dragonTigerPoster from '../../assets/dragon_tiger.jpg';

export const DragonTiger: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [prediction, setPrediction] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [message, setMessage] = useState('');

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prediction) {
      setMessage('Please select a prediction (Dragon, Tiger, or Tie) first.');
      return;
    }
    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setMessage('Please enter a valid bet amount.');
      return;
    }
    if (amt > currentBalance) {
      setMessage('Insufficient balance.');
      return;
    }
    setMessage('Coming Soon: Real multiplayer seed drawing will be active soon!');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Swords className="text-neon-pink" size={24} /> Dragon vs Tiger
        </h1>
        <p className="text-xs text-gray-400">Predict who draws the higher card — the legendary Dragon or the powerful Tiger.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bet controls */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-5 relative overflow-hidden">
          {/* Balance Area */}
          <div className="p-4 bg-dark-900 border border-dark-750/80 rounded-xl space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <span>Current Wallet</span>
              <span className={`px-2 py-0.5 rounded text-[8px] ${balanceMode === 'REAL' ? 'bg-neon-gold/15 text-neon-gold border border-neon-gold/20' : 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20'}`}>
                {balanceMode} BALANCE
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Wallet size={16} className="text-neon-cyan" />
              <span className="text-xl font-black">${currentBalance.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePlaceBet} className="space-y-4">
            {/* Prediction Selection */}
            <div>
              <label className="block text-[10px] text-gray-550 uppercase font-black tracking-wider mb-2">Predict Winner</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dragon', label: 'Dragon', color: 'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50', activeColor: 'bg-red-950/40 border-red-500 text-red-400 shadow-neon-pink-glow' },
                  { id: 'tie', label: 'Tie (8x)', color: 'border-neon-gold/20 text-neon-gold hover:bg-neon-gold/10 hover:border-neon-gold/50', activeColor: 'bg-neon-gold/15 border-neon-gold text-neon-gold shadow-neon-gold-glow' },
                  { id: 'tiger', label: 'Tiger', color: 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50', activeColor: 'bg-blue-950/40 border-blue-500 text-blue-400 shadow-neon-cyan-glow' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setPrediction(opt.id as any); setMessage(''); }}
                    className={`py-3 px-1 border rounded-xl text-center text-xs font-black transition-all ${
                      prediction === opt.id ? opt.activeColor : opt.color
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet size */}
            <div>
              <label className="block text-[10px] text-gray-550 uppercase font-black tracking-wider mb-1.5">Bet Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-xs">$</span>
                <input
                  type="number"
                  value={betSize}
                  onChange={(e) => { setBetSize(e.target.value); setMessage(''); }}
                  className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-16 text-sm font-bold text-white focus:outline-none focus:border-neon-cyan"
                />
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setBetSize((prev) => Math.max(1, Math.floor(parseFloat(prev) / 2)).toString())}
                    className="px-2 py-1 bg-dark-800 hover:bg-dark-750 text-[9px] text-gray-400 font-black rounded-lg border border-dark-700/60"
                  >
                    1/2
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetSize((prev) => (parseFloat(prev) * 2).toString())}
                    className="px-2 py-1 bg-dark-800 hover:bg-dark-750 text-[9px] text-gray-400 font-black rounded-lg border border-dark-700/60"
                  >
                    2X
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyber-gradient hover:opacity-95 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-neon-purple/20 flex justify-center items-center gap-1.5 uppercase tracking-wider"
            >
              <Play size={12} fill="currentColor" /> Place Bet
            </button>
          </form>

          {message && (
            <div className="p-3 bg-dark-900 border border-dark-750 text-center text-xs font-bold text-white rounded-xl animate-scale-up">
              <div className="flex items-center justify-center gap-1.5 text-neon-cyan text-glow-cyan text-[11px]">
                <Sparkles size={13} className="shrink-0" />
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Poster banner and Coming Soon badge */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 overflow-hidden relative min-h-[350px] md:h-[450px] flex items-center justify-center group">
          {/* Main poster image */}
          <img
            src={dragonTigerPoster}
            alt="Dragon vs Tiger Poster"
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Premium dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-dark-950/50" />

          {/* Coming Soon Glowing Badge */}
          <div className="relative z-10 text-center space-y-4 px-6 py-8 rounded-3xl bg-dark-950/90 border border-neon-gold/30 shadow-2xl backdrop-blur-md max-w-sm mx-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neon-gold/15 border border-neon-gold/35 text-[9px] font-black text-neon-gold uppercase tracking-widest animate-pulse shadow-neon-gold-glow">
              <Sparkles size={11} className="text-neon-gold" /> Coming Soon
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Dragon vs Tiger Arena
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              We are working with regulatory RNG compliance commissions to certify this dynamic card dealer multiplayer pool. Launching shortly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

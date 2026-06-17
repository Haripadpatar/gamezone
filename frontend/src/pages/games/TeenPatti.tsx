import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, Club } from 'lucide-react';
import teenPattiPoster from '../../assets/teen_patti.png';

export const TeenPatti: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [message, setMessage] = useState('');

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setMessage('Please enter a valid bet amount.');
      return;
    }
    if (amt > currentBalance) {
      setMessage('Insufficient balance.');
      return;
    }
    setMessage('Coming Soon: Real-time peer-to-peer card rooms will launch shortly!');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Club className="text-neon-gold" size={24} /> Teen Patti
        </h1>
        <p className="text-xs text-gray-400">Play the legendary Indian 3-card poker game with players worldwide.</p>
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
            {/* Bet size */}
            <div>
              <label className="block text-[10px] text-gray-550 uppercase font-black tracking-wider mb-1.5">Ante Bet Amount ($)</label>
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
              <Play size={12} fill="currentColor" /> Play Teen Patti
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
            src={teenPattiPoster}
            alt="Teen Patti Poster"
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
              Teen Patti Table
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Experience authentic Indian poker with high-stakes blind options, custom tables, and multi-player tournaments. Coming very soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

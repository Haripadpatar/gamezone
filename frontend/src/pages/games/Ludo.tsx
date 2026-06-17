import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, AlertCircle, Gamepad2 } from 'lucide-react';
import ludoPoster from '../../assets/ludo.png';

export const Ludo: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Game states
  const [diceVal, setDiceVal] = useState<number | null>(null);
  const [playerPosition, setPlayerPosition] = useState(0);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (playing) return;

    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid bet amount.');
      return;
    }

    if (amt > currentBalance) {
      setError('Insufficient balance.');
      return;
    }

    const success = placeBet(amt);
    if (!success) {
      setError('Failed to deduct balance.');
      return;
    }

    setPlaying(true);
    setDiceVal(null);
    setMessage('Rolling dice...');

    // Simulate dice rolling animation intervals
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        
        // Final roll result
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceVal(finalRoll);

        // Calculate board position change
        setPlayerPosition(prev => {
          const nextPos = prev + finalRoll;
          return nextPos > 12 ? nextPos % 12 : nextPos;
        });

        // Determine multiplier payouts based on roll
        let mult = 0;
        if (finalRoll === 6) {
          mult = 2.5;
        } else if (finalRoll === 5) {
          mult = 1.8;
        } else if (finalRoll === 4) {
          mult = 1.2;
        }

        const winnings = parseFloat((amt * mult).toFixed(2));
        settleBet(amt, winnings, 'Ludo', mult);

        if (winnings > 0) {
          setMessage(`ROLLED A ${finalRoll}! Token advanced. Win multiplier +$${winnings.toFixed(2)} (${mult}x)!`);
        } else {
          setMessage(`ROLLED A ${finalRoll}! Landed on safe zone. Better luck next time.`);
        }

        setPlaying(false);
      }
    }, 120);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Gamepad2 className="text-neon-cyan" size={24} /> Ludo
        </h1>
        <p className="text-xs text-gray-400">Roll the dice, race tokens, and win multipliers in the classic board game.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bet controls */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-5 relative overflow-hidden">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5 animate-scale-up">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Balance Area */}
          <div className="p-4 bg-dark-900 border border-dark-750/80 rounded-xl space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-gray-550 font-bold uppercase tracking-wider">
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
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Game Entry Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-xs">$</span>
                <input
                  type="number"
                  value={betSize}
                  disabled={playing}
                  onChange={(e) => { setBetSize(e.target.value); setError(''); }}
                  className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-16 text-sm font-bold text-white focus:outline-none focus:border-neon-cyan disabled:opacity-50"
                />
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    disabled={playing}
                    onClick={() => setBetSize((prev) => Math.max(1, Math.floor(parseFloat(prev) / 2)).toString())}
                    className="px-2 py-1 bg-dark-800 hover:bg-dark-750 text-[9px] text-gray-400 font-black rounded-lg border border-dark-700/60 disabled:opacity-50"
                  >
                    1/2
                  </button>
                  <button
                    type="button"
                    disabled={playing}
                    onClick={() => setBetSize((prev) => (parseFloat(prev) * 2).toString())}
                    className="px-2 py-1 bg-dark-800 hover:bg-dark-750 text-[9px] text-gray-400 font-black rounded-lg border border-dark-700/60 disabled:opacity-50"
                  >
                    2X
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={playing}
              className="w-full py-2.5 bg-cyber-gradient hover:opacity-95 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-neon-purple/20 flex justify-center items-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
            >
              <Play size={12} fill="currentColor" /> {playing ? 'Rolling...' : 'Roll Dice'}
            </button>
          </form>

          {message && (
            <div className="p-3 bg-dark-900 border border-dark-750 text-center text-xs font-bold text-white rounded-xl animate-scale-up">
              <div className="flex items-center justify-center gap-1.5 text-neon-cyan text-[11px]">
                <Sparkles size={13} className="shrink-0 text-neon-cyan animate-pulse" />
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Arena */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 overflow-hidden relative min-h-[350px] md:h-[450px] flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0">
            <img
              src={ludoPoster}
              alt="Ludo Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
            
            {/* Board representation (12 cell track) */}
            <div className="grid grid-cols-4 grid-rows-4 h-56 w-56 bg-dark-900/65 border-4 border-dark-700 rounded-2xl relative p-2 shadow-inner">
              {/* Draw 12 track cells */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const cellPositions = [
                  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
                  { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 4, col: 3 },
                  { row: 4, col: 2 }, { row: 4, col: 1 }, { row: 3, col: 1 }, { row: 2, col: 1 }
                ];
                const pos = cellPositions[idx];
                const isActive = playerPosition === idx + 1;
                
                let cellColor = 'bg-dark-800';
                if (idx === 0) cellColor = 'bg-red-500/20 border-red-500/40';
                if (idx === 3) cellColor = 'bg-yellow-500/20 border-yellow-500/40';
                if (idx === 6) cellColor = 'bg-green-500/20 border-green-500/40';
                if (idx === 9) cellColor = 'bg-blue-500/20 border-blue-500/40';

                return (
                  <div
                    key={idx}
                    style={{ gridRow: pos.row, gridColumn: pos.col }}
                    className={`border border-dark-700/60 rounded flex items-center justify-center transition-all ${cellColor}`}
                  >
                    {isActive && (
                      <span className="h-5.5 w-5.5 rounded-full bg-neon-cyan shadow-neon-cyan-glow animate-scale-up border-2 border-white" />
                    )}
                  </div>
                );
              })}
              
              {/* Home center core */}
              <div className="row-start-2 row-end-4 col-start-2 col-end-4 border border-dark-750 bg-dark-950/90 rounded-xl flex items-center justify-center text-[10px] font-black text-neon-gold">
                HOME
              </div>
            </div>

            {/* Dice Display */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-[10px] font-black text-gray-550 uppercase tracking-widest">Dice Shaker</span>
              <div className={`h-20 w-20 rounded-2xl bg-white text-black border-2 border-dark-600 shadow-xl flex items-center justify-center font-black text-4xl transition-all duration-300 ${
                playing ? 'animate-bounce rotate-12 bg-gray-100 scale-95' : 'rotate-0'
              }`}>
                {diceVal !== null ? diceVal : '🎲'}
              </div>
            </div>

          </div>

          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>Roll 6 pays 2.5x</span>
            <span>Roll 4-5 pays bonus multiplier</span>
          </div>
        </div>

      </div>
    </div>
  );
};

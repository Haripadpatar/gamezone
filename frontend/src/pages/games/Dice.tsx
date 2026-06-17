import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Dice5, Play, ShieldAlert } from 'lucide-react';

export const Dice: React.FC = () => {
  const { placeBet, settleBet, houseRtp } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [targetRoll, setTargetRoll] = useState(50.50);
  const [rollMode, setRollMode] = useState<'under' | 'over'>('under');
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [winStatus, setWinStatus] = useState<'win' | 'lose' | null>(null);
  const [error, setError] = useState('');
  const [recentRolls, setRecentRolls] = useState<Array<{ roll: number; won: boolean }>>([]);

  // Calculate Win Chance
  const winChance = rollMode === 'under' ? targetRoll : 100 - targetRoll;

  // Calculate Multiplier based on Win Chance and House RTP
  const multiplier = winChance > 0 
    ? parseFloat(((houseRtp / winChance)).toFixed(4))
    : 0;

  const handleRollDice = () => {
    setError('');
    setWinStatus(null);

    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid bet amount.');
      return;
    }

    const success = placeBet(amt);
    if (!success) {
      setError('Insufficient balance to place bet.');
      return;
    }

    setRolling(true);

    // Number roll shuffling animation
    let ticks = 0;
    const interval = setInterval(() => {
      setRollResult(parseFloat((Math.random() * 100).toFixed(2)));
      ticks++;

      if (ticks > 12) {
        clearInterval(interval);
        
        // Final Roll Result (0.00 - 99.99)
        const finalRoll = parseFloat((Math.random() * 100).toFixed(2));
        setRollResult(finalRoll);
        
        // Check win conditions
        const isWon = rollMode === 'under' 
          ? finalRoll < targetRoll 
          : finalRoll > targetRoll;

        const mult = isWon ? multiplier : 0;
        const winnings = parseFloat((amt * mult).toFixed(2));

        settleBet(amt, winnings, 'Dice', mult);
        setWinStatus(isWon ? 'win' : 'lose');
        
        // Save to game roll history log
        setRecentRolls(prev => [{ roll: finalRoll, won: isWon }, ...prev.slice(0, 7)]);
        setRolling(false);
      }
    }, 90);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Dice5 className="text-neon-emerald" size={24} /> Lucky Dice
        </h1>
        <p className="text-xs text-gray-400">Configure roll targets, adjust win chances with multiplier payouts, and roll the dice.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Play controls */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5 animate-scale-up">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bet size */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Bet Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
              <input
                type="number"
                value={betSize}
                disabled={rolling}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-emerald disabled:opacity-50"
              />
            </div>
          </div>

          {/* Roll Mode */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Roll Mode</label>
            <div className="flex bg-dark-900 border border-dark-750 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                disabled={rolling}
                onClick={() => setRollMode('under')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  rollMode === 'under' ? 'bg-dark-800 text-white font-extrabold shadow' : 'text-gray-400'
                }`}
              >
                Roll Under
              </button>
              <button
                type="button"
                disabled={rolling}
                onClick={() => setRollMode('over')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  rollMode === 'over' ? 'bg-dark-800 text-white font-extrabold shadow' : 'text-gray-400'
                }`}
              >
                Roll Over
              </button>
            </div>
          </div>

          <button
            onClick={handleRollDice}
            disabled={rolling}
            className="w-full py-2.5 bg-neon-emerald hover:bg-neon-emerald/85 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-neon-emerald/25 flex justify-center items-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" /> Roll Dice
          </button>

          {/* Dynamic math metrics stats box */}
          <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-505">Multiplier Return</span>
              <span className="font-extrabold text-white">{multiplier.toFixed(4)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-505">Winning Probability</span>
              <span className="font-extrabold text-neon-emerald">{winChance.toFixed(2)}%</span>
            </div>
          </div>

        </div>

        {/* Board Panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 space-y-8 min-h-[300px]">
          
          {/* Roll outcome indicator display */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Roll Result</div>
              <div className={`text-6xl font-black ${
                winStatus === 'win' ? 'text-neon-emerald text-glow-emerald' : 
                winStatus === 'lose' ? 'text-neon-pink' : 'text-white'
              } tracking-tighter mt-1 h-16`}>
                {rollResult !== null ? rollResult.toFixed(2) : '50.00'}
              </div>
            </div>

            {winStatus && (
              <div className={`px-4 py-2 rounded-xl border text-xs font-black animate-scale-up uppercase tracking-widest ${
                winStatus === 'win' 
                  ? 'bg-emerald-950/45 border-emerald-500/25 text-neon-emerald shadow-neon-emerald' 
                  : 'bg-red-950/20 border-red-500/20 text-neon-pink'
              }`}>
                {winStatus === 'win' ? 'Win!' : 'Lose'}
              </div>
            )}
          </div>

          {/* Range Slider controls */}
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between text-xs font-bold text-gray-450">
              <span>0.00</span>
              <span className="text-white bg-dark-900 border border-dark-750 px-2 py-0.5 rounded-lg select-all">
                Target: {targetRoll.toFixed(2)}
              </span>
              <span>100.00</span>
            </div>
            
            <input
              type="range"
              min="2.00"
              max="98.00"
              step="0.05"
              value={targetRoll}
              disabled={rolling}
              onChange={(e) => setTargetRoll(parseFloat(e.target.value))}
              className="w-full h-2 bg-dark-950 border border-dark-850 rounded-lg appearance-none cursor-pointer accent-neon-emerald"
            />

            {/* Slider track visuals */}
            <div className="h-4 w-full bg-dark-950 border border-dark-850 rounded-lg overflow-hidden flex relative select-none">
              <div 
                style={{ 
                  width: `${targetRoll}%` 
                }}
                className={`h-full ${rollMode === 'under' ? 'bg-neon-emerald/30' : 'bg-neon-pink/30'} transition-all`}
              />
              <div 
                style={{ 
                  width: `${100 - targetRoll}%` 
                }}
                className={`h-full ${rollMode === 'over' ? 'bg-neon-emerald/30' : 'bg-neon-pink/30'} transition-all`}
              />
              {/* Boundary divider line */}
              <div 
                style={{ left: `${targetRoll}%` }}
                className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
              />
            </div>
          </div>

          {/* Roll history strip */}
          <div className="w-full border-t border-dark-750/50 pt-4 space-y-2">
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Recent Rolls</div>
            <div className="flex gap-2 overflow-x-auto py-1">
              {recentRolls.length === 0 ? (
                <div className="text-[10px] text-gray-555 italic py-1">Roll the dice to log results.</div>
              ) : (
                recentRolls.map((log, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${
                      log.won 
                        ? 'bg-emerald-950/40 border-emerald-500/20 text-neon-emerald' 
                        : 'bg-red-950/20 border-red-500/20 text-neon-pink'
                    }`}
                  >
                    {log.roll.toFixed(2)}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

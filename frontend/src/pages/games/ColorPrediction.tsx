import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { HelpCircle, ShieldAlert, Coins, Clock } from 'lucide-react';

interface PredictionBet {
  choice: 'red' | 'green' | 'violet' | number;
  amount: number;
}

export const ColorPrediction: React.FC = () => {
  const { placeBet, settleBet } = useGame();
  
  const [activeChipAmount, setActiveChipAmount] = useState(10);
  const [placedBets, setPlacedBets] = useState<PredictionBet[]>([]);
  const [timer, setTimer] = useState(15);
  const [isLocked, setIsLocked] = useState(false);
  const [outcomeNum, setOutcomeNum] = useState<number | null>(null);
  const [outcomeColors, setOutcomeColors] = useState<string[]>([]);
  const [winningsMsg, setWinningsMsg] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ number: number; colors: string[] }>>([
    { number: 3, colors: ['green'] },
    { number: 8, colors: ['red'] },
    { number: 5, colors: ['green', 'violet'] },
    { number: 2, colors: ['red'] },
    { number: 0, colors: ['red', 'violet'] }
  ]);

  // Periodic Timer Clock Logic
  useEffect(() => {
    const clock = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Timer hits 0! Trigger result resolution
          resolvePredictionCycle();
          return 15; // Reset cycle
        }
        
        // Lock bets in the last 4 seconds
        if (prev <= 5) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(clock);
  }, [placedBets]);

  const handlePlaceBet = (choice: PredictionBet['choice']) => {
    setError('');
    if (isLocked) {
      setError('Betting is locked. Wait for the next cycle.');
      return;
    }

    const success = placeBet(activeChipAmount);
    if (!success) {
      setError('Insufficient balance to place bet.');
      return;
    }

    setPlacedBets(prev => {
      const idx = prev.findIndex(b => b.choice === choice);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].amount += activeChipAmount;
        return updated;
      }
      return [...prev, { choice, amount: activeChipAmount }];
    });
  };

  const resolvePredictionCycle = () => {
    setError('');
    
    // Generate final digit (0-9)
    const finalNum = Math.floor(Math.random() * 10);
    
    // Map digit to color arrays
    // Green: 1, 3, 7, 9
    // Red: 2, 4, 6, 8
    // Violet: 0, 5
    // Note: 0 is Red+Violet, 5 is Green+Violet in standard prediction formats
    const colors: string[] = [];
    if (finalNum === 0) {
      colors.push('red', 'violet');
    } else if (finalNum === 5) {
      colors.push('green', 'violet');
    } else if (finalNum % 2 === 0) {
      colors.push('red');
    } else {
      colors.push('green');
    }

    setOutcomeNum(finalNum);
    setOutcomeColors(colors);

    // Calculate payouts
    let totalWin = 0;
    let totalBet = 0;

    placedBets.forEach(bet => {
      totalBet += bet.amount;
      let won = false;
      let multiplier = 0;

      if (typeof bet.choice === 'string') {
        if (colors.includes(bet.choice)) {
          won = true;
          // Standard multipliers
          if (bet.choice === 'violet') multiplier = 4.5;
          else multiplier = 2.0; // Red/Green
        }
      } else if (typeof bet.choice === 'number') {
        if (bet.choice === finalNum) {
          won = true;
          multiplier = 9.0;
        }
      }

      if (won) {
        totalWin += bet.amount * multiplier;
      }
    });

    const netMultiplier = totalBet > 0 ? parseFloat((totalWin / totalBet).toFixed(2)) : 0;
    
    // Settle balance wagers
    settleBet(totalBet, totalWin, 'Color Prediction', netMultiplier);

    if (totalWin > 0) {
      setWinningsMsg(`Round Win: +$${totalWin.toFixed(2)}!`);
    } else if (totalBet > 0) {
      setWinningsMsg('No matches. Try again!');
    }

    // Update history trend list
    setHistory(prev => [{ number: finalNum, colors }, ...prev.slice(0, 10)]);
    setPlacedBets([]);
    
    // Clear outcome message after 4.5 seconds
    setTimeout(() => {
      setWinningsMsg('');
      setOutcomeNum(null);
      setOutcomeColors([]);
    }, 4500);
  };

  const totalBetsPlaced = placedBets.reduce((acc, b) => acc + b.amount, 0);

  const getNumberColorClass = (num: number) => {
    if (num === 0) return 'from-red-500 to-purple-500';
    if (num === 5) return 'from-emerald-500 to-purple-500';
    return num % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <HelpCircle className="text-pink-500" size={24} /> Color Prediction
        </h1>
        <p className="text-xs text-gray-400">Bet on colors (Red, Green, Violet) or digit segments. Clock triggers rounds every 15 seconds.</p>
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

          {/* Timer details */}
          <div className="flex justify-between items-center bg-dark-900 border border-dark-750 p-3 rounded-xl">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <Clock size={14} className={isLocked ? 'text-neon-pink animate-pulse' : 'text-neon-cyan'} />
              Round Timer
            </span>
            <span className={`text-xl font-black ${isLocked ? 'text-neon-pink' : 'text-white'}`}>
              {timer}s
            </span>
          </div>

          {isLocked && (
            <div className="p-2.5 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl text-[10px] font-bold text-center animate-pulse uppercase tracking-wider">
              Betting Locked. Resolving Outcomes...
            </div>
          )}

          {/* Chip Value Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Select Bet Value</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setActiveChipAmount(val)}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                    activeChipAmount === val 
                      ? 'border-neon-pink bg-neon-pink/5 text-white' 
                      : 'border-dark-700 bg-dark-900 text-gray-400 hover:text-gray-250 disabled:opacity-50'
                  }`}
                >
                  <Coins size={12} className={activeChipAmount === val ? 'text-neon-pink' : 'text-gray-500'} />
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPlacedBets([])}
            disabled={isLocked || placedBets.length === 0}
            className="w-full py-2 bg-dark-900 hover:bg-dark-800 border border-dark-750 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            Clear Placed Wagers
          </button>

          {/* Live placed bet statistics */}
          <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Active Wager Sum</span>
              <span className="font-extrabold text-neon-pink">${totalBetsPlaced}</span>
            </div>
            
            <div className="border-t border-dark-750 pt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
              {placedBets.length === 0 ? (
                <div className="text-[10px] text-gray-500 italic text-center py-2">No bets placed in this block.</div>
              ) : (
                placedBets.map((bet, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-gray-300">
                    <span className="capitalize">Choice: {bet.choice}</span>
                    <span className="font-extrabold text-white">${bet.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Display Panel board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 space-y-6">
          
          {/* Wheel / Outcome display */}
          <div className="flex items-center gap-6 bg-dark-950/60 border border-dark-800 p-4 rounded-2xl w-full max-w-md justify-between shadow-2xl min-h-[72px]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Round Outcome</span>
              {outcomeNum !== null ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center justify-center h-10 w-10 text-lg font-black text-white rounded-xl border animate-scale-up bg-gradient-to-tr ${getNumberColorClass(outcomeNum)} shadow-lg`}>
                    {outcomeNum}
                  </span>
                  <div className="flex gap-1">
                    {outcomeColors.map(c => (
                      <span key={c} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                        c === 'red' ? 'bg-red-650' : c === 'green' ? 'bg-emerald-600' : 'bg-purple-600'
                      }`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2 font-semibold flex items-center gap-1">
                  <Clock size={12} className="animate-spin text-neon-cyan" /> Waiting for cycle timer...
                </div>
              )}
            </div>

            {winningsMsg && (
              <div className="px-4 py-2 bg-dark-900 border border-dark-750 text-xs font-black text-neon-emerald text-glow-emerald rounded-xl animate-scale-up shadow">
                {winningsMsg}
              </div>
            )}
          </div>

          {/* Interactive board selection grids */}
          <div className="w-full space-y-6 select-none">
            
            {/* Color buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePlaceBet('green')}
                disabled={isLocked}
                className="py-3 bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/25 text-white font-black rounded-xl text-center shadow-lg shadow-emerald-950/40 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Green (2.0x)
              </button>
              <button
                onClick={() => handlePlaceBet('violet')}
                disabled={isLocked}
                className="py-3 bg-purple-650 hover:bg-purple-600 border border-purple-500/25 text-white font-black rounded-xl text-center shadow-lg shadow-purple-950/40 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Violet (4.5x)
              </button>
              <button
                onClick={() => handlePlaceBet('red')}
                disabled={isLocked}
                className="py-3 bg-red-650 hover:bg-red-650/90 border border-red-500/25 text-white font-black rounded-xl text-center shadow-lg shadow-red-950/40 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Red (2.0x)
              </button>
            </div>

            {/* Digit buttons */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Predict Digits (9.0x payout)</div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePlaceBet(idx)}
                    disabled={isLocked}
                    className={`py-3 rounded-xl border text-white font-black text-xs text-center transition-all bg-gradient-to-tr ${getNumberColorClass(idx)} border-white/5 shadow-md hover:scale-[1.03] disabled:opacity-50`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>

            {/* Trend History Strip */}
            <div className="border-t border-dark-750/50 pt-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Trend History Charts</div>
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {history.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-black text-white bg-gradient-to-tr ${getNumberColorClass(h.number)} shadow`}>
                      {h.number}
                    </span>
                    <div className="flex gap-0.5">
                      {h.colors.map(col => (
                        <span 
                          key={col} 
                          className={`h-1.5 w-1.5 rounded-full ${
                            col === 'red' ? 'bg-red-550' : col === 'green' ? 'bg-emerald-500' : 'bg-purple-500'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

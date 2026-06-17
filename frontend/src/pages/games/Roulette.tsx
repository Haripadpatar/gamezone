import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CircleDot, ShieldAlert, Coins } from 'lucide-react';

interface BetChip {
  type: 'color_red' | 'color_black' | 'parity_even' | 'parity_odd' | 'range_1to12' | 'range_13to24' | 'range_25to36' | 'single_number';
  value: string | number; // Number chosen or label
  amount: number;
}

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const Roulette: React.FC = () => {
  const { placeBet, settleBet } = useGame();
  
  const [activeChipAmount, setActiveChipAmount] = useState(10);
  const [placedBets, setPlacedBets] = useState<BetChip[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [outcomeNumber, setOutcomeNumber] = useState<number | null>(null);
  const [outcomeColor, setOutcomeColor] = useState<'red' | 'black' | 'green' | null>(null);
  const [winningsMsg, setWinningsMsg] = useState('');
  const [error, setError] = useState('');

  const handlePlaceBet = (type: BetChip['type'], value: string | number) => {
    setError('');
    
    // Check if player has enough balance to add this bet chip
    const success = placeBet(activeChipAmount);
    if (!success) {
      setError('Insufficient balance to place chip.');
      return;
    }

    // Accumulate chip amount if same bet type
    setPlacedBets(prev => {
      const idx = prev.findIndex(b => b.type === type && b.value === value);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].amount += activeChipAmount;
        return updated;
      }
      return [...prev, { type, value, amount: activeChipAmount }];
    });
  };

  const handleClearBets = () => {
    if (spinning) return;
    
    // In a real game, clearing bets would refund. Since bets are placed instantly in state,
    // we settle back the bets to their main wallet (refund).
    const totalRefund = placedBets.reduce((acc, b) => acc + b.amount, 0);
    if (totalRefund > 0) {
      settleBet(0, totalRefund, 'Roulette Refund', 1);
    }
    setPlacedBets([]);
  };

  const handleSpinWheel = () => {
    if (placedBets.length === 0) {
      setError('Please place at least one chip on the board.');
      return;
    }

    setSpinning(true);
    setWinningsMsg('');

    // Simulate roulette ball spinning around the wheel rim
    let ticks = 0;
    const interval = setInterval(() => {
      setOutcomeNumber(Math.floor(Math.random() * 37));
      ticks++;

      if (ticks > 18) {
        clearInterval(interval);
        
        // Final outcome (0-36)
        const finalNum = Math.floor(Math.random() * 37);
        const color = finalNum === 0 ? 'green' : RED_NUMBERS.has(finalNum) ? 'red' : 'black';
        
        setOutcomeNumber(finalNum);
        setOutcomeColor(color);
        calculateWins(finalNum, color);
        setSpinning(false);
      }
    }, 120);
  };

  const calculateWins = (number: number, color: 'red' | 'black' | 'green') => {
    let totalWin = 0;
    let totalBet = 0;

    placedBets.forEach(bet => {
      totalBet += bet.amount;
      let won = false;
      let multiplier = 0;

      if (bet.type === 'color_red' && color === 'red') {
        won = true;
        multiplier = 2;
      } else if (bet.type === 'color_black' && color === 'black') {
        won = true;
        multiplier = 2;
      } else if (bet.type === 'parity_even' && number !== 0 && number % 2 === 0) {
        won = true;
        multiplier = 2;
      } else if (bet.type === 'parity_odd' && number % 2 !== 0) {
        won = true;
        multiplier = 2;
      } else if (bet.type === 'range_1to12' && number >= 1 && number <= 12) {
        won = true;
        multiplier = 3;
      } else if (bet.type === 'range_13to24' && number >= 13 && number <= 24) {
        won = true;
        multiplier = 3;
      } else if (bet.type === 'range_25to36' && number >= 25 && number <= 36) {
        won = true;
        multiplier = 3;
      } else if (bet.type === 'single_number' && Number(bet.value) === number) {
        won = true;
        multiplier = 36;
      }

      if (won) {
        totalWin += bet.amount * multiplier;
      }
    });

    const netMultiplier = totalBet > 0 ? parseFloat((totalWin / totalBet).toFixed(2)) : 0;
    
    // Credit wagers to wallet
    settleBet(totalBet, totalWin, 'Roulette', netMultiplier);
    
    if (totalWin > 0) {
      setWinningsMsg(`You won +$${totalWin.toFixed(2)}!`);
    } else {
      setWinningsMsg('No winning chips. Try again!');
    }

    // Reset bets after spin settles
    setPlacedBets([]);
  };

  const totalBetsPlaced = placedBets.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CircleDot className="text-red-500" size={24} /> Roulette Royale
        </h1>
        <p className="text-xs text-gray-400">Select chip values, distribute bets across boards, and spin the roulette wheel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Play controls panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5 animate-scale-up">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chip Value selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Select Chip Value</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setActiveChipAmount(val)}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                    activeChipAmount === val 
                      ? 'border-neon-cyan bg-neon-cyan/5 text-white' 
                      : 'border-dark-700 bg-dark-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Coins size={12} className={activeChipAmount === val ? 'text-neon-cyan' : 'text-gray-500'} />
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSpinWheel}
              disabled={spinning}
              className="flex-1 py-2.5 bg-neon-pink hover:bg-neon-pink/85 text-white font-black text-xs rounded-xl shadow-lg shadow-neon-pink/15 uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Spin Wheel
            </button>
            <button
              onClick={handleClearBets}
              disabled={spinning || placedBets.length === 0}
              className="py-2.5 px-4 border border-dark-700 bg-dark-900 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {/* Placed bets details */}
          <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Wagers Placed</span>
              <span className="font-extrabold text-neon-cyan">${totalBetsPlaced}</span>
            </div>
            
            <div className="border-t border-dark-750 pt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
              {placedBets.length === 0 ? (
                <div className="text-[10px] text-gray-500 italic text-center py-2">No chips on board yet.</div>
              ) : (
                placedBets.map((bet, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-gray-300">
                    <span>{bet.type.replace('_', ' ').replace('color', 'Color').replace('parity', 'Parity').replace('range', 'Range')}: {bet.value}</span>
                    <span className="font-extrabold text-white">${bet.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Board & Wheel Display */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 space-y-6">
          
          {/* Wheel spin visualization */}
          <div className="flex items-center gap-6 bg-dark-950/60 border border-dark-800 p-4 rounded-2xl w-full max-w-md justify-between shadow-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Outcome Log</span>
              {outcomeNumber !== null ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center justify-center h-10 w-10 text-lg font-black text-white rounded-xl border animate-scale-up ${
                    outcomeColor === 'green' ? 'bg-emerald-950 border-emerald-500/25 text-neon-emerald shadow-neon-emerald' :
                    outcomeColor === 'red' ? 'bg-red-950 border-red-500/25 text-red-500 shadow-neon-pink' :
                    'bg-slate-900 border-dark-700 text-white shadow-glass'
                  }`}>
                    {outcomeNumber}
                  </span>
                  <span className="text-xs font-semibold text-gray-350 capitalize">{outcomeColor} lands!</span>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2 font-semibold">Spin the wheel to roll...</div>
              )}
            </div>

            {winningsMsg && (
              <div className="px-4 py-2 bg-dark-900 border border-dark-750 text-xs font-black text-neon-emerald text-glow-emerald rounded-xl animate-scale-up shadow">
                {winningsMsg}
              </div>
            )}
          </div>

          {/* Interactive board layouts */}
          <div className="w-full space-y-4 select-none">
            {/* Number grid selector */}
            <div className="grid grid-cols-12 gap-1 border border-dark-800 bg-dark-900/60 p-2 rounded-xl max-h-[140px] overflow-y-auto">
              <button
                onClick={() => handlePlaceBet('single_number', 0)}
                className="col-span-12 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-neon-emerald font-black text-[10px] text-center"
              >
                0 Green
              </button>
              {Array.from({ length: 36 }).map((_, idx) => {
                const num = idx + 1;
                const isRed = RED_NUMBERS.has(num);
                return (
                  <button
                    key={num}
                    onClick={() => handlePlaceBet('single_number', num)}
                    className={`py-1.5 rounded-lg font-bold text-[9px] border text-center transition-all ${
                      isRed 
                        ? 'bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-950/40' 
                        : 'bg-slate-900/40 border-dark-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Special block odds selectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => handlePlaceBet('color_red', 'Red')}
                className="py-3 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 text-red-400 font-extrabold rounded-xl text-center"
              >
                Red (2x)
              </button>
              <button
                onClick={() => handlePlaceBet('color_black', 'Black')}
                className="py-3 bg-slate-950/60 hover:bg-slate-900/80 border border-dark-700 text-white font-extrabold rounded-xl text-center"
              >
                Black (2x)
              </button>
              <button
                onClick={() => handlePlaceBet('parity_even', 'Even')}
                className="py-3 bg-dark-900 hover:bg-dark-800 border border-dark-750 text-gray-300 font-extrabold rounded-xl text-center"
              >
                Even (2x)
              </button>
              <button
                onClick={() => handlePlaceBet('parity_odd', 'Odd')}
                className="py-3 bg-dark-900 hover:bg-dark-800 border border-dark-750 text-gray-300 font-extrabold rounded-xl text-center"
              >
                Odd (2x)
              </button>
            </div>

            {/* Column ranges */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                onClick={() => handlePlaceBet('range_1to12', '1st 12')}
                className="py-2.5 bg-dark-900 hover:bg-dark-850 border border-dark-750 text-gray-400 font-bold rounded-xl text-center"
              >
                1st 12 (3x)
              </button>
              <button
                onClick={() => handlePlaceBet('range_13to24', '2nd 12')}
                className="py-2.5 bg-dark-900 hover:bg-dark-850 border border-dark-750 text-gray-400 font-bold rounded-xl text-center"
              >
                2nd 12 (3x)
              </button>
              <button
                onClick={() => handlePlaceBet('range_25to36', '3rd 12')}
                className="py-2.5 bg-dark-900 hover:bg-dark-850 border border-dark-750 text-gray-400 font-bold rounded-xl text-center"
              >
                3rd 12 (3x)
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

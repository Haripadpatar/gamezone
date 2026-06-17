import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Coins, Play, AlertCircle } from 'lucide-react';

interface SymbolConfig {
  char: string;
  name: string;
  multiplier: number;
  color: string;
}

const SYMBOLS: SymbolConfig[] = [
  { char: '🍒', name: 'Cherry', multiplier: 2.5, color: 'text-red-500' },
  { char: '🍇', name: 'Grape', multiplier: 4.0, color: 'text-purple-500' },
  { char: '🍋', name: 'Lemon', multiplier: 6.0, color: 'text-yellow-450' },
  { char: '🔔', name: 'Bell', multiplier: 12.0, color: 'text-amber-500 text-glow-gold' },
  { char: '💎', name: 'Diamond', multiplier: 35.0, color: 'text-neon-cyan text-glow-cyan' },
  { char: '7️⃣', name: 'Lucky 7', multiplier: 80.0, color: 'text-neon-pink text-glow-pink' }
];

export const Slots: React.FC = () => {
  const { placeBet, settleBet, houseRtp } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [reels, setReels] = useState<string[]>(['💎', '💎', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [error, setError] = useState('');
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const handleSpin = () => {
    setError('');
    setOutcomeMessage('');
    setWinAmount(0);

    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid bet amount.');
      return;
    }

    const betSuccess = placeBet(amt);
    if (!betSuccess) {
      setError('Insufficient balance to place bet.');
      return;
    }

    setSpinning(true);

    // Spin animation intervals
    let spinsCount = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char
      ]);
      spinsCount++;

      if (spinsCount > 15) {
        clearInterval(interval);
        
        // Final outcomes (weighted based on RTP)
        const isWin = Math.random() < (houseRtp / 100) * 0.45; // 45% win chance modified by RTP
        let finalReels: string[] = [];
        
        if (isWin) {
          // Determine matching level (3 matching or 2 matching)
          const isThreeMatch = Math.random() < 0.25; // 25% chance of 3-match if win
          const targetSymbol = SYMBOLS[Math.floor(Math.random() * (isThreeMatch ? SYMBOLS.length : SYMBOLS.length - 1))];
          
          if (isThreeMatch) {
            finalReels = [targetSymbol.char, targetSymbol.char, targetSymbol.char];
          } else {
            // 2 Match
            const nonMatchSymbol = SYMBOLS.find(s => s.char !== targetSymbol.char) || SYMBOLS[0];
            const positions = [
              [targetSymbol.char, targetSymbol.char, nonMatchSymbol.char],
              [targetSymbol.char, nonMatchSymbol.char, targetSymbol.char],
              [nonMatchSymbol.char, targetSymbol.char, targetSymbol.char]
            ];
            finalReels = positions[Math.floor(Math.random() * positions.length)];
          }
        } else {
          // Distribute no-win combos
          do {
            finalReels = [
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char
            ];
          } while (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]);
        }

        setReels(finalReels);
        calculatePayout(finalReels, amt);
        setSpinning(false);
      }
    }, 100);
  };

  const calculatePayout = (finalReels: string[], bet: number) => {
    const [r1, r2, r3] = finalReels;
    let multiplier = 0;
    let msg = 'Try again!';

    if (r1 === r2 && r2 === r3) {
      // 3 matching symbols
      const matched = SYMBOLS.find(s => s.char === r1);
      if (matched) {
        multiplier = matched.multiplier;
        msg = `JACKPOT! 3x ${matched.name} matches.`;
      }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      // 2 matching symbols
      const matchChar = r1 === r2 ? r1 : r3;
      const matched = SYMBOLS.find(s => s.char === matchChar);
      if (matched) {
        multiplier = matched.multiplier * 0.4; // 2-match payout multiplier
        msg = `Nice! 2x ${matched.name} matches.`;
      }
    }

    const winnings = parseFloat((bet * multiplier).toFixed(2));
    setWinAmount(winnings);
    setOutcomeMessage(msg);
    
    // Settle balance changes
    settleBet(bet, winnings, 'Slots', multiplier);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Coins className="text-neon-gold" size={24} /> Golden Slots
        </h1>
        <p className="text-xs text-gray-400">Match icons on a 3-reel spinner to claim payout multiplier multipliers.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Play panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
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
                disabled={spinning}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-gold disabled:opacity-50"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {['½', '2x', 'Max'].map(label => (
                <button
                  key={label}
                  type="button"
                  disabled={spinning}
                  onClick={() => {
                    const currentBet = parseFloat(betSize) || 10;
                    if (label === '½') setBetSize((Math.max(1, currentBet / 2)).toString());
                    if (label === '2x') setBetSize((currentBet * 2).toString());
                    if (label === 'Max') setBetSize('100');
                  }}
                  className="flex-1 py-1 bg-dark-900 hover:bg-dark-800 border border-dark-750 text-[10px] font-bold text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`w-full py-2.5 bg-neon-gold hover:bg-neon-gold/85 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-neon-gold/20 flex justify-center items-center gap-1.5 uppercase tracking-wider ${
              spinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play size={14} fill="currentColor" /> Spin Reels
          </button>

          {/* Settle Message */}
          {outcomeMessage && (
            <div className={`p-3 rounded-xl border text-center text-xs font-bold animate-scale-up ${
              winAmount > 0 
                ? 'bg-emerald-950/40 border-emerald-500/20 text-neon-emerald' 
                : 'bg-dark-900 border-dark-750 text-gray-400'
            }`}>
              <div>{outcomeMessage}</div>
              {winAmount > 0 && <div className="text-sm font-black mt-1">Received +${winAmount.toFixed(2)}</div>}
            </div>
          )}

        </div>

        {/* Display panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 relative min-h-[300px]">
          
          {/* Machine Outer Layout */}
          <div className="w-full max-w-md bg-dark-950/80 border border-dark-700 rounded-3xl p-5 shadow-2xl space-y-6">
            
            {/* Header lights */}
            <div className="flex justify-between items-center border-b border-dark-750 pb-3">
              <div className="flex gap-1">
                <span className={`h-2.5 w-2.5 rounded-full ${spinning ? 'bg-red-500 animate-ping' : 'bg-red-750'}`} />
                <span className={`h-2.5 w-2.5 rounded-full ${spinning ? 'bg-neon-cyan animate-ping delay-75' : 'bg-cyan-750'}`} />
                <span className={`h-2.5 w-2.5 rounded-full ${spinning ? 'bg-neon-purple animate-ping delay-150' : 'bg-purple-750'}`} />
              </div>
              <span className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase">Golden Jackpots</span>
            </div>

            {/* Reels Window */}
            <div className="grid grid-cols-3 gap-3 bg-dark-900 border border-dark-800 p-4 rounded-2xl shadow-inner relative">
              
              {/* Glass reflection line */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl" />

              {reels.map((symbol, idx) => (
                <div 
                  key={idx}
                  className="bg-dark-950 border border-dark-750 rounded-xl aspect-[3/4] flex items-center justify-center text-4xl md:text-5xl shadow-2xl relative overflow-hidden select-none"
                >
                  <div className={spinning ? 'animate-bounce' : ''}>{symbol}</div>
                </div>
              ))}
            </div>

            {/* Paytable Summary */}
            <div className="space-y-2 border-t border-dark-750 pt-3">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Symbol Multipliers</div>
              <div className="grid grid-cols-3 gap-2">
                {SYMBOLS.map(sym => (
                  <div key={sym.name} className="flex justify-between items-center bg-dark-900/40 p-1.5 rounded border border-dark-800 text-[10px]">
                    <span className="mr-1">{sym.char}</span>
                    <span className="text-gray-450 font-semibold">{sym.name}</span>
                    <span className="font-extrabold text-neon-gold">{sym.multiplier}x</span>
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

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Swords, Wallet, Play, Sparkles, AlertCircle } from 'lucide-react';
import dragonTigerPoster from '../../assets/dragon_tiger.jpg';

interface Card {
  value: number;
  label: string;
  suit: string;
  color: 'red' | 'black';
}

const SUITS = [
  { char: '♠', color: 'black' },
  { char: '♥', color: 'red' },
  { char: '♦', color: 'red' },
  { char: '♣', color: 'black' }
];

const CARD_VALUES = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: 'J' },
  { value: 12, label: 'Q' },
  { value: 13, label: 'K' },
  { value: 14, label: 'A' }
];

export const DragonTiger: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [prediction, setPrediction] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Cards state
  const [dragonCard, setDragonCard] = useState<Card | null>(null);
  const [tigerCard, setTigerCard] = useState<Card | null>(null);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const drawCard = (): Card => {
    const valObj = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    const suitObj = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
      value: valObj.value,
      label: valObj.label,
      suit: suitObj.char,
      color: suitObj.color as 'red' | 'black'
    };
  };

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (playing) return;

    if (!prediction) {
      setError('Please select your prediction (Dragon, Tiger, or Tie).');
      return;
    }

    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid bet amount.');
      return;
    }

    if (amt > currentBalance) {
      setError('Insufficient balance to place bet.');
      return;
    }

    // Deduct bet amount
    const success = placeBet(amt);
    if (!success) {
      setError('Failed to deduct balance.');
      return;
    }

    setPlaying(true);
    setDragonCard(null);
    setTigerCard(null);
    setMessage('Dealing cards...');

    setTimeout(() => {
      const dCard = drawCard();
      const tCard = drawCard();
      setDragonCard(dCard);
      setTigerCard(tCard);

      let winner: 'dragon' | 'tiger' | 'tie';
      if (dCard.value > tCard.value) {
        winner = 'dragon';
      } else if (dCard.value < tCard.value) {
        winner = 'tiger';
      } else {
        winner = 'tie';
      }

      let winnings = 0;
      let multiplier = 0;

      if (prediction === winner) {
        multiplier = winner === 'tie' ? 8 : 2;
        winnings = parseFloat((amt * multiplier).toFixed(2));
        settleBet(amt, winnings, 'Dragon vs Tiger', multiplier);
        setMessage(`WINNER: ${winner.toUpperCase()}! You won +$${winnings.toFixed(2)} (${multiplier}x)`);
      } else {
        settleBet(amt, 0, 'Dragon vs Tiger', 0);
        setMessage(`WINNER: ${winner.toUpperCase()}! Better luck next time.`);
      }

      setPlaying(false);
    }, 1500);
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
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5 animate-scale-up">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-2">Predict Winner</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dragon', label: 'Dragon (2x)', color: 'border-red-500/20 text-red-450 hover:bg-red-500/10 hover:border-red-500/50', activeColor: 'bg-red-950/40 border-red-500 text-red-400 shadow-neon-pink-glow' },
                  { id: 'tie', label: 'Tie (8x)', color: 'border-neon-gold/20 text-neon-gold hover:bg-neon-gold/10 hover:border-neon-gold/50', activeColor: 'bg-neon-gold/15 border-neon-gold text-neon-gold shadow-neon-gold-glow' },
                  { id: 'tiger', label: 'Tiger (2x)', color: 'border-blue-500/20 text-blue-450 hover:bg-blue-500/10 hover:border-blue-500/50', activeColor: 'bg-blue-950/40 border-blue-500 text-blue-400 shadow-neon-cyan-glow' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={playing}
                    onClick={() => { setPrediction(opt.id as any); setError(''); }}
                    className={`py-3 px-1 border rounded-xl text-center text-[10.5px] font-black transition-all ${
                      prediction === opt.id ? opt.activeColor : opt.color
                    } disabled:opacity-50`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet size */}
            <div>
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Bet Amount ($)</label>
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
              <Play size={12} fill="currentColor" /> {playing ? 'Dealing...' : 'Place Bet'}
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
          {/* Background Poster Cover */}
          <div className="absolute inset-0 z-0">
            <img
              src={dragonTigerPoster}
              alt="Dragon vs Tiger Poster"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          {/* Table Area */}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center space-y-10">
            
            {/* Draw Display */}
            <div className="grid grid-cols-2 gap-10 md:gap-20 w-full max-w-lg justify-items-center">
              
              {/* Dragon card block */}
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-black text-red-500 uppercase tracking-widest text-glow-red">DRAGON</span>
                <div className={`h-40 w-28 rounded-2xl border-2 flex flex-col justify-between p-3 select-none transition-all duration-305 ${
                  dragonCard 
                    ? 'bg-white text-black border-red-500 shadow-neon-pink-glow scale-100 rotate-0' 
                    : 'bg-dark-900 border-dark-700 text-gray-500 scale-95 border-dashed'
                }`}>
                  {dragonCard ? (
                    <>
                      <div className="flex justify-between items-start font-black text-lg">
                        <span>{dragonCard.label}</span>
                        <span className={dragonCard.color === 'red' ? 'text-red-505' : 'text-black'}>{dragonCard.suit}</span>
                      </div>
                      <div className={`text-4xl text-center ${dragonCard.color === 'red' ? 'text-red-505' : 'text-black'}`}>{dragonCard.suit}</div>
                      <div className="flex justify-between items-end font-black text-lg rotate-180">
                        <span>{dragonCard.label}</span>
                        <span className={dragonCard.color === 'red' ? 'text-red-505' : 'text-black'}>{dragonCard.suit}</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center font-black text-[9px] uppercase tracking-wider text-gray-600">
                      {playing ? '...' : 'Place Bet'}
                    </div>
                  )}
                </div>
              </div>

              {/* Tiger card block */}
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-black text-blue-500 uppercase tracking-widest text-glow-cyan">TIGER</span>
                <div className={`h-40 w-28 rounded-2xl border-2 flex flex-col justify-between p-3 select-none transition-all duration-305 ${
                  tigerCard 
                    ? 'bg-white text-black border-blue-500 shadow-neon-cyan-glow scale-100 rotate-0' 
                    : 'bg-dark-900 border-dark-700 text-gray-500 scale-95 border-dashed'
                }`}>
                  {tigerCard ? (
                    <>
                      <div className="flex justify-between items-start font-black text-lg">
                        <span>{tigerCard.label}</span>
                        <span className={tigerCard.color === 'red' ? 'text-red-505' : 'text-black'}>{tigerCard.suit}</span>
                      </div>
                      <div className={`text-4xl text-center ${tigerCard.color === 'red' ? 'text-red-505' : 'text-black'}`}>{tigerCard.suit}</div>
                      <div className="flex justify-between items-end font-black text-lg rotate-180">
                        <span>{tigerCard.label}</span>
                        <span className={tigerCard.color === 'red' ? 'text-red-505' : 'text-black'}>{tigerCard.suit}</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center font-black text-[9px] uppercase tracking-wider text-gray-600">
                      {playing ? '...' : 'Place Bet'}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Bottom stats disclaimer */}
          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>RNG seeds drawing certified</span>
            <span>House edge: 3.73%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

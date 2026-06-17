import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, AlertCircle, Club } from 'lucide-react';
import teenPattiPoster from '../../assets/teen_patti.png';

interface Card {
  label: string;
  suit: string;
  value: number;
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

export const TeenPatti: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Hands state
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);

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

  const getHandRank = (cards: Card[]): { score: number; label: string } => {
    if (cards.length < 3) return { score: 0, label: 'High Card' };

    const vals = cards.map(c => c.value).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);

    const isTrio = vals[0] === vals[1] && vals[1] === vals[2];
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
    const isStraight = (vals[1] === vals[0] + 1 && vals[2] === vals[1] + 1) || 
                       (vals[0] === 2 && vals[1] === 3 && vals[2] === 14); // Ace low straight

    if (isTrio) return { score: 6, label: 'Trio' };
    if (isStraight && isFlush) return { score: 5, label: 'Pure Sequence' };
    if (isStraight) return { score: 4, label: 'Sequence' };
    if (isFlush) return { score: 3, label: 'Color' };

    const isPair = vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2];
    if (isPair) return { score: 2, label: 'Pair' };

    return { score: 1, label: 'High Card' };
  };

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
    setPlayerCards([]);
    setDealerCards([]);
    setMessage('Dealing cards...');

    setTimeout(() => {
      const p1 = drawCard();
      let p2 = drawCard();
      while (p2.label === p1.label && p2.suit === p1.suit) p2 = drawCard();
      let p3 = drawCard();
      while ((p3.label === p1.label && p3.suit === p1.suit) || (p3.label === p2.label && p3.suit === p2.suit)) p3 = drawCard();

      const d1 = drawCard();
      const d2 = drawCard();
      const d3 = drawCard();

      const pHand = [p1, p2, p3];
      const dHand = [d1, d2, d3];

      setPlayerCards(pHand);
      setDealerCards(dHand);

      const pRank = getHandRank(pHand);
      const dRank = getHandRank(dHand);

      let winner: 'player' | 'dealer' | 'tie' = 'player';
      if (pRank.score > dRank.score) {
        winner = 'player';
      } else if (pRank.score < dRank.score) {
        winner = 'dealer';
      } else {
        // Evaluate high card
        const pHigh = Math.max(...pHand.map(c => c.value));
        const dHigh = Math.max(...dHand.map(c => c.value));
        if (pHigh > dHigh) {
          winner = 'player';
        } else if (pHigh < dHigh) {
          winner = 'dealer';
        } else {
          winner = 'tie';
        }
      }

      if (winner === 'player') {
        const mult = pRank.score >= 4 ? 3 : 2; // Sequence or higher pays 3x
        const winnings = parseFloat((amt * mult).toFixed(2));
        settleBet(amt, winnings, 'Teen Patti', mult);
        setMessage(`WIN: Dealer has ${dRank.label}. You win +$${winnings.toFixed(2)} with ${pRank.label}!`);
      } else if (winner === 'tie') {
        settleBet(amt, amt, 'Teen Patti', 1);
        setMessage(`TIE: Wagers returned. Both have ${pRank.label}.`);
      } else {
        settleBet(amt, 0, 'Teen Patti', 0);
        setMessage(`LOSS: Dealer wins with ${dRank.label}. You had ${pRank.label}.`);
      }

      setPlaying(false);
    }, 1500);
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
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Ante Bet Amount ($)</label>
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
              <Play size={12} fill="currentColor" /> {playing ? 'Dealing...' : 'Play Teen Patti'}
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
              src={teenPattiPoster}
              alt="Teen Patti Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center items-center space-y-6">
            
            {/* Dealer Row */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dealer Cards</span>
              <div className="flex gap-3">
                {dealerCards.length > 0 ? (
                  dealerCards.map((card, idx) => (
                    <div key={idx} className="h-28 w-20 bg-white text-black border border-dark-700 rounded-xl flex flex-col justify-between p-2 select-none">
                      <div className="flex justify-between items-start font-bold text-sm">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-505' : 'text-black'}`}>{card.suit}</div>
                      <div className="flex justify-between items-end font-bold text-sm rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-28 w-20 bg-dark-900 border border-dark-750/80 border-dashed rounded-xl flex items-center justify-center text-[10px] text-gray-650">
                      ?
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Divider lines */}
            <div className="w-full max-w-xs border-t border-dark-805/50 my-1" />

            {/* Player Row */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Your Cards</span>
              <div className="flex gap-3">
                {playerCards.length > 0 ? (
                  playerCards.map((card, idx) => (
                    <div key={idx} className="h-28 w-20 bg-white text-black border border-neon-cyan/40 shadow-neon-cyan/10 rounded-xl flex flex-col justify-between p-2 select-none">
                      <div className="flex justify-between items-start font-bold text-sm">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-505' : 'text-black'}`}>{card.suit}</div>
                      <div className="flex justify-between items-end font-bold text-sm rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-28 w-20 bg-dark-900 border border-dark-750/80 border-dashed rounded-xl flex items-center justify-center text-[10px] text-gray-650">
                      ?
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>Standard 3-Card Rankings</span>
            <span>Trio beats Sequence</span>
          </div>
        </div>

      </div>
    </div>
  );
};

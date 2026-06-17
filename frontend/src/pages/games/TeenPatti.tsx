import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, AlertCircle, Club, Eye, Trash2 } from 'lucide-react';
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
  const [gameStage, setGameStage] = useState<'idle' | 'play' | 'showdown'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(['W', 'L', 'W', 'W', 'L', 'W', 'L', 'W']);

  // Game Hands & Pot
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [isSeen, setIsSeen] = useState(false);
  const [pot, setPot] = useState(0);
  const [playerContribution, setPlayerContribution] = useState(0);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const drawCard = (exclude: Card[]): Card => {
    while (true) {
      const valObj = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
      const suitObj = SUITS[Math.floor(Math.random() * SUITS.length)];
      const candidate: Card = {
        value: valObj.value,
        label: valObj.label,
        suit: suitObj.char,
        color: suitObj.color as 'red' | 'black'
      };
      if (!exclude.some(c => c.value === candidate.value && c.suit === candidate.suit)) {
        return candidate;
      }
    }
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

  // Start round - Deal cards face down
  const handleDealHand = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

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
      setError('Failed to deduct initial Boot bet.');
      return;
    }

    // Initialize round cards
    const pool: Card[] = [];
    const p1 = drawCard(pool); pool.push(p1);
    const p2 = drawCard(pool); pool.push(p2);
    const p3 = drawCard(pool); pool.push(p3);
    const d1 = drawCard(pool); pool.push(d1);
    const d2 = drawCard(pool); pool.push(d2);
    const d3 = drawCard(pool); pool.push(d3);

    setPlayerCards([p1, p2, p3]);
    setDealerCards([d1, d2, d3]);
    setIsSeen(false);
    setPot(amt * 2); // Player + Dealer Boot match
    setPlayerContribution(amt);
    setGameStage('play');
    setMessage('Cards dealt face down (Blind). Chaal cost is 1x. Click See Cards to reveal.');
  };

  const handleAction = (actionType: 'chaal' | 'see' | 'pack' | 'showdown') => {
    setError('');

    if (actionType === 'see') {
      setIsSeen(true);
      setMessage('You revealed your cards. Wagers are now doubled (Seen).');
      return;
    }

    if (actionType === 'pack') {
      // Fold: player forfeits pot contributions
      settleBet(playerContribution, 0, 'Teen Patti', 0);
      setGameStage('idle');
      setMessage(`You Packed (Folded). Forfeited $${playerContribution.toFixed(2)} to dealer.`);
      setHistory(prev => [...prev.slice(1), 'L']);
      return;
    }

    const costMult = isSeen ? 2 : 1;
    const wagerCost = parseFloat(betSize) * costMult;

    if (actionType === 'chaal') {
      if (wagerCost > currentBalance) {
        setError('Insufficient balance to play Chaal.');
        return;
      }
      const success = placeBet(wagerCost);
      if (!success) {
        setError('Failed to place Chaal bet.');
        return;
      }

      setPlayerContribution(prev => prev + wagerCost);
      setPot(prev => prev + wagerCost * 2); // Dealer matches wager
      setMessage(`You played Chaal ($${wagerCost}). Dealer matched. Pot is now $${(pot + wagerCost * 2)}.`);
    } else if (actionType === 'showdown') {
      // Showdown wager is placed before evaluation
      if (wagerCost > currentBalance) {
        setError('Insufficient balance for Showdown.');
        return;
      }
      const success = placeBet(wagerCost);
      if (!success) {
        setError('Failed to place Showdown bet.');
        return;
      }

      const finalPlayerContrib = playerContribution + wagerCost;
      const finalPot = pot + wagerCost * 2; // Dealer matches Showdown wager

      setPlayerContribution(finalPlayerContrib);
      setPot(finalPot);

      const pRank = getHandRank(playerCards);
      const dRank = getHandRank(dealerCards);

      let winner: 'player' | 'dealer' | 'tie' = 'player';
      if (pRank.score > dRank.score) {
        winner = 'player';
      } else if (pRank.score < dRank.score) {
        winner = 'dealer';
      } else {
        // Compare High Card
        const pHigh = Math.max(...playerCards.map(c => c.value));
        const dHigh = Math.max(...dealerCards.map(c => c.value));
        if (pHigh > dHigh) winner = 'player';
        else if (dHigh > pHigh) winner = 'dealer';
        else winner = 'tie';
      }

      setGameStage('showdown');

      if (winner === 'player') {
        settleBet(finalPlayerContrib, finalPot, 'Teen Patti', finalPot / finalPlayerContrib);
        setMessage(`WINNER: YOU! Dealer had ${dRank.label}. You win pot of $${finalPot.toFixed(2)} with ${pRank.label}!`);
        setHistory(prev => [...prev.slice(1), 'W']);
      } else if (winner === 'tie') {
        settleBet(finalPlayerContrib, finalPlayerContrib, 'Teen Patti', 1);
        setMessage(`TIE: Wagers returned. Both have ${pRank.label}.`);
        setHistory(prev => [...prev.slice(1), 'T']);
      } else {
        settleBet(finalPlayerContrib, 0, 'Teen Patti', 0);
        setMessage(`LOSS: Dealer wins with ${dRank.label}. You had ${pRank.label}.`);
        setHistory(prev => [...prev.slice(1), 'L']);
      }
    }
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

          {gameStage === 'idle' ? (
            <form onSubmit={handleDealHand} className="space-y-4">
              {/* Bet size */}
              <div>
                <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Bet Boot Size ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={betSize}
                    onChange={(e) => { setBetSize(e.target.value); setError(''); }}
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
                <Play size={12} fill="currentColor" /> Deal Hand
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Active pot display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-dark-900 p-3 rounded-xl border border-dark-800 text-center">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">ACTIVE POT</span>
                  <div className="text-base font-black text-neon-gold font-mono">${pot}</div>
                </div>
                <div className="bg-dark-900 p-3 rounded-xl border border-dark-800 text-center">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">YOUR BETS</span>
                  <div className="text-base font-black text-neon-cyan font-mono">${playerContribution}</div>
                </div>
              </div>

              {gameStage === 'play' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {!isSeen && (
                      <button
                        onClick={() => handleAction('see')}
                        className="py-2 px-1 border border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/15 rounded-xl text-center text-xs font-black transition-all flex items-center justify-center gap-1"
                      >
                        <Eye size={12} /> See Cards
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('chaal')}
                      className="py-2 px-1 border border-neon-gold/20 text-neon-gold bg-neon-gold/5 hover:bg-neon-gold/15 rounded-xl text-center text-xs font-black transition-all"
                    >
                      Chaal (${parseFloat(betSize) * (isSeen ? 2 : 1)})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction('pack')}
                      className="py-2 px-1 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-xl text-center text-xs font-black transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Pack (Fold)
                    </button>
                    <button
                      onClick={() => handleAction('showdown')}
                      className="py-2 px-1 border border-neon-purple/20 text-neon-purple bg-neon-purple/5 hover:bg-neon-purple/15 rounded-xl text-center text-xs font-black transition-all"
                    >
                      Showdown
                    </button>
                  </div>
                </>
              )}

              {gameStage === 'showdown' && (
                <button
                  onClick={() => setGameStage('idle')}
                  className="w-full py-2.5 bg-cyber-gradient hover:opacity-95 text-white font-black text-xs rounded-xl transition-all shadow-lg"
                >
                  Start New Hand
                </button>
              )}
            </div>
          )}

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
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 overflow-hidden relative min-h-[380px] md:h-[450px] flex flex-col justify-between p-6">
          {/* Background Poster Cover */}
          <div className="absolute inset-0 z-0">
            <img
              src={teenPattiPoster}
              alt="Teen Patti Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          {/* Road Map Win History */}
          <div className="relative z-10 flex items-center justify-between bg-dark-900/60 border border-dark-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] font-black text-neon-gold tracking-widest uppercase">ROADMAP</span>
            <div className="flex items-center gap-1.5">
              {history.map((hist, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                    hist === 'W'
                      ? 'bg-neon-cyan/15 border border-neon-cyan text-neon-cyan shadow-neon-cyan-glow'
                      : hist === 'L'
                      ? 'bg-red-950/40 border border-red-500/35 text-red-400 shadow-neon-pink-glow'
                      : 'bg-neon-gold/15 border border-neon-gold text-neon-gold shadow-neon-gold-glow'
                  }`}
                >
                  {hist}
                </span>
              ))}
            </div>
          </div>

          {/* Table Felt */}
          <div className="relative z-10 flex-1 flex flex-col justify-between items-center my-4 space-y-6">
            {/* Dealer Hand */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-pink tracking-widest uppercase">DEALER HAND</span>
              <div className="flex gap-2 min-h-[85px]">
                {dealerCards.length > 0 ? (
                  dealerCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`h-22 w-16 rounded-lg flex flex-col justify-between p-1.5 select-none transition-all shadow-md ${
                        gameStage === 'showdown'
                          ? 'bg-white text-black border-2 border-neon-pink shadow-neon-pink-glow'
                          : 'bg-gradient-to-br from-neon-pink to-neon-purple border-2 border-dark-600'
                      }`}
                    >
                      {gameStage === 'showdown' ? (
                        <>
                          <div className="flex justify-between items-start font-black text-[9px] leading-none">
                            <span>{card.label}</span>
                            <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                          </div>
                          <div className={`text-base text-center leading-none ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                            {card.suit}
                          </div>
                          <div className="flex justify-between items-end font-black text-[9px] leading-none rotate-180">
                            <span>{card.label}</span>
                            <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] font-black text-white/50 tracking-wider">
                          AGX
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-22 w-16 rounded-lg border border-dashed border-dark-750 bg-dark-900/40" />
                )}
              </div>
              {gameStage === 'showdown' && dealerCards.length > 0 && (
                <span className="text-[9px] px-2 py-0.5 bg-neon-pink/15 border border-neon-pink/30 text-neon-pink rounded-full font-black">
                  {getHandRank(dealerCards).label}
                </span>
              )}
            </div>

            {/* Player Hand */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-cyan tracking-widest uppercase">YOUR HAND</span>
              <div className="flex gap-2 min-h-[85px]">
                {playerCards.length > 0 ? (
                  playerCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`h-22 w-16 rounded-lg flex flex-col justify-between p-1.5 select-none transition-all shadow-md ${
                        isSeen || gameStage === 'showdown'
                          ? 'bg-white text-black border-2 border-neon-cyan shadow-neon-cyan-glow'
                          : 'bg-gradient-to-br from-neon-cyan to-dark-750 border-2 border-dark-600'
                      }`}
                    >
                      {isSeen || gameStage === 'showdown' ? (
                        <>
                          <div className="flex justify-between items-start font-black text-[9px] leading-none">
                            <span>{card.label}</span>
                            <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                          </div>
                          <div className={`text-base text-center leading-none ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                            {card.suit}
                          </div>
                          <div className="flex justify-between items-end font-black text-[9px] leading-none rotate-180">
                            <span>{card.label}</span>
                            <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] font-black text-white/50 tracking-wider">
                          AGX
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-22 w-16 rounded-lg border border-dashed border-dark-750 bg-dark-900/40 animate-pulse" />
                )}
              </div>
              {(isSeen || gameStage === 'showdown') && playerCards.length > 0 && (
                <span className="text-[9px] px-2 py-0.5 bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan rounded-full font-black">
                  {getHandRank(playerCards).label}
                </span>
              )}
            </div>
          </div>

          {/* Bottom stats disclaimer */}
          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>RNG seeds drawing certified</span>
            <span>Seen double chaal rule applied</span>
          </div>
        </div>

      </div>
    </div>
  );
};

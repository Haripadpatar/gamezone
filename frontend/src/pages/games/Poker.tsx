import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, Club, AlertCircle } from 'lucide-react';
import pokerPoster from '../../assets/poker.png';

interface Card {
  value: number; // 2-14
  label: string;
  suit: string;
  color: 'red' | 'black';
}

interface HandResult {
  score: number;
  name: string;
  tiebreaker: number;
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

export const Poker: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [gameStage, setGameStage] = useState<'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Poker game states
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [botCards, setBotCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [currentWager, setCurrentWager] = useState(0);
  const [playerHand, setPlayerHand] = useState<HandResult | null>(null);
  const [botHand, setBotHand] = useState<HandResult | null>(null);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  // Draws a random card, ensuring no duplicates across all active cards in the round
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

  // Evaluate poker hand ranking from hole cards and community cards (7-card hand)
  const evaluateHand = (hole: Card[], community: Card[]): HandResult => {
    const all = [...hole, ...community];
    
    // Suit counts
    const suitCounts: { [key: string]: number } = {};
    const valCounts: { [key: number]: number } = {};
    all.forEach(c => {
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
      valCounts[c.value] = (valCounts[c.value] || 0) + 1;
    });

    // Check Flush
    let isFlush = false;
    let flushSuit = '';
    Object.keys(suitCounts).forEach(s => {
      if (suitCounts[s] >= 5) {
        isFlush = true;
        flushSuit = s;
      }
    });

    // Check Straight
    const uniqueVals = Array.from(new Set(all.map(c => c.value))).sort((a, b) => b - a);
    let isStraight = false;
    let straightHigh = 0;
    for (let i = 0; i <= uniqueVals.length - 5; i++) {
      if (uniqueVals[i] - uniqueVals[i + 4] === 4) {
        isStraight = true;
        straightHigh = uniqueVals[i];
        break;
      }
    }
    // A-5 straight special case
    if (!isStraight && uniqueVals.includes(14) && uniqueVals.includes(2) && uniqueVals.includes(3) && uniqueVals.includes(4) && uniqueVals.includes(5)) {
      isStraight = true;
      straightHigh = 5;
    }

    // Pairs, Trips, Quads counts
    const pairs: number[] = [];
    let trips = 0;
    let quads = 0;
    Object.keys(valCounts).forEach(vKey => {
      const val = parseInt(vKey);
      const cnt = valCounts[val];
      if (cnt === 4) quads = val;
      else if (cnt === 3) trips = Math.max(trips, val);
      else if (cnt === 2) pairs.push(val);
    });
    pairs.sort((a, b) => b - a);

    // Rank matching:
    if (isFlush && isStraight) return { score: 8, name: 'Straight Flush', tiebreaker: straightHigh };
    if (quads > 0) return { score: 7, name: 'Four of a Kind', tiebreaker: quads };
    if (trips > 0 && pairs.length > 0) return { score: 6, name: 'Full House', tiebreaker: trips * 15 + pairs[0] };
    if (isFlush) {
      const flushCards = all.filter(c => c.suit === flushSuit).map(c => c.value).sort((a, b) => b - a);
      return { score: 5, name: 'Flush', tiebreaker: flushCards[0] };
    }
    if (isStraight) return { score: 4, name: 'Straight', tiebreaker: straightHigh };
    if (trips > 0) return { score: 3, name: 'Three of a Kind', tiebreaker: trips };
    if (pairs.length >= 2) return { score: 2, name: 'Two Pair', tiebreaker: pairs[0] * 15 + pairs[1] };
    if (pairs.length === 1) return { score: 1, name: 'One Pair', tiebreaker: pairs[0] };

    const highCard = Math.max(...all.map(c => c.value));
    return { score: 0, name: 'High Card', tiebreaker: highCard };
  };

  const handleStartLobby = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const amt = parseFloat(betSize);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid buy-in amount.');
      return;
    }

    if (amt > currentBalance) {
      setError('Insufficient balance to join poker table.');
      return;
    }

    const success = placeBet(amt);
    if (!success) {
      setError('Failed to deduct buy-in.');
      return;
    }

    // Initialize round
    const cardsPool: Card[] = [];
    const p1 = drawCard(cardsPool); cardsPool.push(p1);
    const p2 = drawCard(cardsPool); cardsPool.push(p2);
    const b1 = drawCard(cardsPool); cardsPool.push(b1);
    const b2 = drawCard(cardsPool); cardsPool.push(b2);

    setPlayerCards([p1, p2]);
    setBotCards([b1, b2]);
    setCommunityCards([]);
    setCurrentWager(amt);
    setPlayerHand(null);
    setBotHand(null);
    setGameStage('preflop');
    setMessage('Pre-flop: Hole cards dealt. Double wagers or check to see the Flop.');
  };

  const handleAction = (type: 'check' | 'raise' | 'fold') => {
    setError('');

    if (type === 'fold') {
      settleBet(currentWager, 0, 'Poker', 0);
      setMessage('You folded. Wager lost.');
      setGameStage('idle');
      return;
    }

    // Compute cost of raise
    const raiseCost = currentWager;
    if (type === 'raise') {
      if (raiseCost > currentBalance) {
        setError('Insufficient balance to raise.');
        return;
      }
      const success = placeBet(raiseCost);
      if (!success) {
        setError('Failed to place raise.');
        return;
      }
      setCurrentWager(prev => prev + raiseCost);
    }

    const pool = [...playerCards, ...botCards, ...communityCards];

    if (gameStage === 'preflop') {
      // Deal Flop (3 cards)
      const f1 = drawCard(pool); pool.push(f1);
      const f2 = drawCard(pool); pool.push(f2);
      const f3 = drawCard(pool); pool.push(f3);
      setCommunityCards([f1, f2, f3]);
      setGameStage('flop');
      setMessage('Flop dealt. Check or Raise to see the Turn.');
    } else if (gameStage === 'flop') {
      // Deal Turn (1 card)
      const turnCard = drawCard(pool); pool.push(turnCard);
      setCommunityCards(prev => [...prev, turnCard]);
      setGameStage('turn');
      setMessage('Turn dealt. Check or Raise to see the River.');
    } else if (gameStage === 'turn') {
      // Deal River (1 card)
      const riverCard = drawCard(pool); pool.push(riverCard);
      setCommunityCards(prev => [...prev, riverCard]);
      setGameStage('river');
      setMessage('River dealt. Final round: Check or Raise to showdown.');
    } else if (gameStage === 'river') {
      // Showdown!
      const finalCommunity = [...communityCards];
      const pResult = evaluateHand(playerCards, finalCommunity);
      const bResult = evaluateHand(botCards, finalCommunity);

      setPlayerHand(pResult);
      setBotHand(bResult);
      setGameStage('showdown');

      const totalBet = type === 'raise' ? currentWager + raiseCost : currentWager;

      if (pResult.score > bResult.score || (pResult.score === bResult.score && pResult.tiebreaker > bResult.tiebreaker)) {
        // Player wins
        const payout = totalBet * 2;
        settleBet(totalBet, payout, 'Poker', 2.0);
        setMessage(`SHOWDOWN WIN: You won +$${payout.toFixed(2)} with a ${pResult.name}!`);
      } else if (bResult.score > pResult.score || (pResult.score === bResult.score && bResult.tiebreaker > pResult.tiebreaker)) {
        // Bot wins
        settleBet(totalBet, 0, 'Poker', 0);
        setMessage(`SHOWDOWN LOSS: Bot wins with a ${bResult.name}. Better luck next time.`);
      } else {
        // Split pot
        settleBet(totalBet, totalBet, 'Poker', 1.0);
        setMessage(`SPLIT POT: Both players hold ${pResult.name}. Wagers returned.`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Club className="text-neon-pink" size={24} /> Poker Texas Hold'em
        </h1>
        <p className="text-xs text-gray-400">Join the ultimate Texas Hold'em tables to test your skills and bluff against real players.</p>
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

          {gameStage === 'idle' ? (
            <form onSubmit={handleStartLobby} className="space-y-4">
              {/* Bet size */}
              <div>
                <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Table Buy-In ($)</label>
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
                <Play size={12} fill="currentColor" /> Enter Lobby
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-dark-900 p-3.5 rounded-xl border border-dark-800 space-y-1.5 text-center">
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-500">Current Wager Stakes</span>
                <div className="text-lg font-black text-white">${currentWager}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction('check')}
                  className="py-2 px-3 border border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/15 rounded-xl text-center text-xs font-black transition-all"
                >
                  {gameStage === 'river' ? 'Showdown' : 'Check / Call'}
                </button>
                <button
                  onClick={() => handleAction('raise')}
                  className="py-2 px-3 border border-neon-gold/20 text-neon-gold bg-neon-gold/5 hover:bg-neon-gold/15 rounded-xl text-center text-xs font-black transition-all"
                >
                  Raise (+${currentWager})
                </button>
              </div>

              <button
                onClick={() => handleAction('fold')}
                className="w-full py-2 bg-red-950/40 border border-red-500/35 hover:bg-red-950/60 text-red-400 rounded-xl text-center text-xs font-black transition-all"
              >
                Fold Hand
              </button>
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
              src={pokerPoster}
              alt="Poker Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          {/* Table Felt */}
          <div className="relative z-10 flex-1 flex flex-col justify-between items-center my-4 space-y-6">
            
            {/* Dealer/Bot Hand */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-pink tracking-widest uppercase">BOT (OPPONENT)</span>
              <div className="flex gap-2 min-h-[80px]">
                {botCards.length > 0 ? (
                  botCards.map((card, idx) => (
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
                            <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
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
              {botHand && (
                <span className="text-[9px] px-2 py-0.5 bg-neon-pink/15 border border-neon-pink/30 text-neon-pink rounded-full font-black">
                  {botHand.name}
                </span>
              )}
            </div>

            {/* Shared Community Cards */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-gold tracking-widest uppercase">COMMUNITY CARDS</span>
              <div className="flex gap-1.5 p-2.5 bg-dark-950/70 border border-dark-800/80 rounded-xl min-h-[90px] items-center">
                {communityCards.length > 0 ? (
                  communityCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="h-20 w-14 bg-white text-black border-2 border-neon-gold shadow-neon-gold-glow rounded-lg flex flex-col justify-between p-1.5 select-none animate-scale-up"
                    >
                      <div className="flex justify-between items-start font-black text-[9px] leading-none">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className={`text-base text-center leading-none ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                        {card.suit}
                      </div>
                      <div className="flex justify-between items-end font-black text-[9px] leading-none rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[9.5px] font-bold text-gray-600 tracking-wider px-10">
                    {gameStage === 'idle' ? 'WAITING BUY-IN' : 'HOLE CARDS DEALT'}
                  </span>
                )}
              </div>
            </div>

            {/* Player Hand */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-cyan tracking-widest uppercase">YOUR HAND (HERO)</span>
              <div className="flex gap-2 min-h-[80px]">
                {playerCards.length > 0 ? (
                  playerCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="h-22 w-16 bg-white text-black border-2 border-neon-cyan shadow-neon-cyan-glow rounded-lg flex flex-col justify-between p-1.5 select-none animate-scale-up"
                    >
                      <div className="flex justify-between items-start font-black text-[9px] leading-none">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className={`text-base text-center leading-none ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                        {card.suit}
                      </div>
                      <div className="flex justify-between items-end font-black text-[9px] leading-none rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-22 w-16 rounded-lg border border-dashed border-dark-750 bg-dark-900/40" />
                )}
              </div>
              {playerHand && (
                <span className="text-[9px] px-2 py-0.5 bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan rounded-full font-black">
                  {playerHand.name}
                </span>
              )}
            </div>

          </div>

          {/* Bottom stats disclaimer */}
          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>RNG seeds drawing certified</span>
            <span>House edge: 2.36%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

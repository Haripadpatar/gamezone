import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, Club, AlertCircle } from 'lucide-react';
import baccaratPoster from '../../assets/baccarat.png';

interface Card {
  label: string;
  score: number;
  suit: string;
  color: 'red' | 'black';
}

const SUITS = [
  { char: '♠', color: 'black' },
  { char: '♥', color: 'red' },
  { char: '♦', color: 'red' },
  { char: '♣', color: 'black' }
];

const CARD_DECK = [
  { label: 'A', score: 1 },
  { label: '2', score: 2 },
  { label: '3', score: 3 },
  { label: '4', score: 4 },
  { label: '5', score: 5 },
  { label: '6', score: 6 },
  { label: '7', score: 7 },
  { label: '8', score: 8 },
  { label: '9', score: 9 },
  { label: '10', score: 0 },
  { label: 'J', score: 0 },
  { label: 'Q', score: 0 },
  { label: 'K', score: 0 }
];

export const Baccarat: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [prediction, setPrediction] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(['B', 'P', 'B', 'B', 'T', 'P', 'B', 'P']);

  // Game Deal States
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [playerFinalScore, setPlayerFinalScore] = useState<number | null>(null);
  const [bankerFinalScore, setBankerFinalScore] = useState<number | null>(null);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  const drawCard = (): Card => {
    const cardVal = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
      label: cardVal.label,
      score: cardVal.score,
      suit: suit.char,
      color: suit.color as 'red' | 'black'
    };
  };

  const getHandScore = (cards: Card[]): number => {
    const sum = cards.reduce((acc, c) => acc + c.score, 0);
    return sum % 10;
  };

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (playing) return;

    if (!prediction) {
      setError('Please select your prediction (Player, Banker, or Tie).');
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
    setPlayerCards([]);
    setBankerCards([]);
    setPlayerFinalScore(null);
    setBankerFinalScore(null);
    setMessage('Dealing initial cards...');

    // 1. Initial 2 Cards each
    setTimeout(() => {
      const p1 = drawCard();
      const b1 = drawCard();
      const p2 = drawCard();
      const b2 = drawCard();

      const pCards = [p1, p2];
      const bCards = [b1, b2];

      setPlayerCards(pCards);
      setBankerCards(bCards);
      
      let pScore = getHandScore(pCards);
      let bScore = getHandScore(bCards);

      setPlayerFinalScore(pScore);
      setBankerFinalScore(bScore);

      // Check for Natural 8 or 9
      if (pScore >= 8 || bScore >= 8) {
        resolveGame(pCards, bCards, amt);
        return;
      }

      // 2. Draw 3rd card rules
      setTimeout(() => {
        let p3rdCard: Card | null = null;
        
        // Player draws 3rd card if score is 0-5
        if (pScore <= 5) {
          p3rdCard = drawCard();
          pCards.push(p3rdCard);
          setPlayerCards([...pCards]);
          pScore = getHandScore(pCards);
          setPlayerFinalScore(pScore);
          setMessage('Player draws 3rd card...');
        }

        setTimeout(() => {
          let bankerDraws = false;

          if (p3rdCard === null) {
            // If Player stands (has 6 or 7), Banker draws if score is 0-5
            if (bScore <= 5) {
              bankerDraws = true;
            }
          } else {
            // Player drew a 3rd card: Banker draws based on Banker score and Player 3rd card score
            const p3rdScore = p3rdCard.score;
            if (bScore <= 2) {
              bankerDraws = true;
            } else if (bScore === 3) {
              bankerDraws = p3rdScore !== 8;
            } else if (bScore === 4) {
              bankerDraws = p3rdScore >= 2 && p3rdScore <= 7;
            } else if (bScore === 5) {
              bankerDraws = p3rdScore >= 4 && p3rdScore <= 7;
            } else if (bScore === 6) {
              bankerDraws = p3rdScore === 6 || p3rdScore === 7;
            }
          }

          if (bankerDraws) {
            const b3 = drawCard();
            bCards.push(b3);
            setBankerCards([...bCards]);
            bScore = getHandScore(bCards);
            setBankerFinalScore(bScore);
            setMessage('Banker draws 3rd card...');
          }

          setTimeout(() => {
            resolveGame(pCards, bCards, amt);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1200);
  };

  const resolveGame = (pCards: Card[], bCards: Card[], amt: number) => {
    const pScore = getHandScore(pCards);
    const bScore = getHandScore(bCards);

    let winner: 'player' | 'banker' | 'tie';
    if (pScore > bScore) {
      winner = 'player';
    } else if (bScore > pScore) {
      winner = 'banker';
    } else {
      winner = 'tie';
    }

    let winnings = 0;
    let multiplier = 0;

    if (prediction === winner) {
      if (winner === 'player') multiplier = 2;
      else if (winner === 'banker') multiplier = 1.95;
      else multiplier = 9;

      winnings = parseFloat((amt * multiplier).toFixed(2));
      settleBet(amt, winnings, 'Baccarat', multiplier);
      setMessage(`WINNER: ${winner.toUpperCase()}! You won +$${winnings.toFixed(2)} (${multiplier}x)`);
    } else {
      settleBet(amt, 0, 'Baccarat', 0);
      setMessage(`WINNER: ${winner.toUpperCase()}! Better luck next time.`);
    }

    // Add to history roadmap
    const histSymbol = winner === 'player' ? 'P' : winner === 'banker' ? 'B' : 'T';
    setHistory(prev => [...prev.slice(1), histSymbol]);
    setPlaying(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Club className="text-neon-cyan" size={24} /> Baccarat
        </h1>
        <p className="text-xs text-gray-400">Bet on Player, Banker, or Tie in this classic high-stakes casino table game.</p>
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
            {/* Prediction Selection */}
            <div>
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-2">Bet On</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'player', label: 'Player (2x)', color: 'border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/50', activeColor: 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-neon-cyan-glow' },
                  { id: 'tie', label: 'Tie (9x)', color: 'border-neon-gold/20 text-neon-gold hover:bg-neon-gold/10 hover:border-neon-gold/50', activeColor: 'bg-neon-gold/15 border-neon-gold text-neon-gold shadow-neon-gold-glow' },
                  { id: 'banker', label: 'Banker (1.95x)', color: 'border-neon-pink/20 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink/50', activeColor: 'bg-neon-pink/15 border-neon-pink text-neon-pink shadow-neon-pink-glow' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={playing}
                    onClick={() => { setPrediction(opt.id as any); setError(''); }}
                    className={`py-3 px-1 border rounded-xl text-center text-[10px] font-black transition-all ${
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
              <Play size={12} fill="currentColor" /> {playing ? 'Dealing...' : 'Play Baccarat'}
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
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 overflow-hidden relative min-h-[380px] md:h-[450px] flex flex-col justify-between p-6">
          {/* Background Poster Cover */}
          <div className="absolute inset-0 z-0">
            <img
              src={baccaratPoster}
              alt="Baccarat Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          {/* Road Map (Bead Plate) */}
          <div className="relative z-10 flex items-center justify-between bg-dark-900/60 border border-dark-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] font-black text-neon-gold tracking-widest uppercase">ROADMAP</span>
            <div className="flex items-center gap-1.5">
              {history.map((hist, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                    hist === 'P'
                      ? 'bg-neon-cyan/15 border border-neon-cyan text-neon-cyan shadow-neon-cyan-glow'
                      : hist === 'B'
                      ? 'bg-neon-pink/15 border border-neon-pink text-neon-pink shadow-neon-pink-glow'
                      : 'bg-neon-gold/15 border border-neon-gold text-neon-gold shadow-neon-gold-glow'
                  }`}
                >
                  {hist}
                </span>
              ))}
            </div>
          </div>

          {/* Table Area */}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center space-y-6 my-4">
            <div className="grid grid-cols-2 gap-8 md:gap-16 w-full max-w-lg justify-items-center">
              
              {/* Player hand display */}
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-black text-neon-cyan uppercase tracking-widest text-glow-cyan">PLAYER</span>
                
                <div className="flex gap-2 min-h-[140px] items-center">
                  {playerCards.length > 0 ? (
                    playerCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="h-32 w-22 bg-white text-black border-2 border-neon-cyan shadow-neon-cyan-glow rounded-xl flex flex-col justify-between p-2 select-none animate-scale-up"
                      >
                        <div className="flex justify-between items-start font-black text-xs">
                          <span>{card.label}</span>
                          <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                        </div>
                        <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                          {card.suit}
                        </div>
                        <div className="flex justify-between items-end font-black text-xs rotate-180">
                          <span>{card.label}</span>
                          <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-32 w-22 rounded-xl border-2 border-dark-700 border-dashed bg-dark-900/60 flex items-center justify-center text-gray-650 font-black text-[9px] uppercase tracking-wider">
                      {playing ? '...' : 'WAITING'}
                    </div>
                  )}
                </div>

                {playerFinalScore !== null && (
                  <span className="px-3 py-1 bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan rounded-full font-black text-[10px]">
                    Score: {playerFinalScore}
                  </span>
                )}
              </div>

              {/* Banker hand display */}
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-black text-neon-pink uppercase tracking-widest text-glow-pink">BANKER</span>
                
                <div className="flex gap-2 min-h-[140px] items-center">
                  {bankerCards.length > 0 ? (
                    bankerCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="h-32 w-22 bg-white text-black border-2 border-neon-pink shadow-neon-pink-glow rounded-xl flex flex-col justify-between p-2 select-none animate-scale-up"
                      >
                        <div className="flex justify-between items-start font-black text-xs">
                          <span>{card.label}</span>
                          <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                        </div>
                        <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                          {card.suit}
                        </div>
                        <div className="flex justify-between items-end font-black text-xs rotate-180">
                          <span>{card.label}</span>
                          <span className={card.color === 'red' ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-32 w-22 rounded-xl border-2 border-dark-700 border-dashed bg-dark-900/60 flex items-center justify-center text-gray-650 font-black text-[9px] uppercase tracking-wider">
                      {playing ? '...' : 'WAITING'}
                    </div>
                  )}
                </div>

                {bankerFinalScore !== null && (
                  <span className="px-3 py-1 bg-neon-pink/15 border border-neon-pink/30 text-neon-pink rounded-full font-black text-[10px]">
                    Score: {bankerFinalScore}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Bottom stats disclaimer */}
          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>RNG seeds drawing certified</span>
            <span>House edge: 1.06%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

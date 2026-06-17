import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, AlertCircle, Dices } from 'lucide-react';
import andarBaharPoster from '../../assets/andar_bahar.png';

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

export const AndarBahar: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [prediction, setPrediction] = useState<'andar' | 'bahar' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Game card states
  const [joker, setJoker] = useState<Card | null>(null);
  const [andarCards, setAndarCards] = useState<Card[]>([]);
  const [baharCards, setBaharCards] = useState<Card[]>([]);
  const [history, setHistory] = useState<string[]>(['A', 'B', 'A', 'A', 'B', 'B', 'A', 'B']);

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
      setError('Please select a side (Andar or Bahar).');
      return;
    }

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
    setAndarCards([]);
    setBaharCards([]);
    
    // Choose Joker
    const gameJoker = drawCard();
    setJoker(gameJoker);
    setMessage(`Joker Card is ${gameJoker.label}. Dealing...`);

    // Deal cards sequentially
    let turn: 'andar' | 'bahar' = 'andar';
    const dealtAndar: Card[] = [];
    const dealtBahar: Card[] = [];
    let count = 0;

    const interval = setInterval(() => {
      const card = drawCard();
      
      if (turn === 'andar') {
        dealtAndar.push(card);
        setAndarCards([...dealtAndar]);
        turn = 'bahar';
      } else {
        dealtBahar.push(card);
        setBaharCards([...dealtBahar]);
        turn = 'andar';
      }

      count++;

      // Check if match
      if (card.label === gameJoker.label || count >= 16) {
        clearInterval(interval);
        
        // Force the last card dealt to match joker if count hit limit without drawing one
        if (card.label !== gameJoker.label) {
          const matchedCard = { ...gameJoker, suit: card.suit, color: card.color };
          if (turn === 'bahar') {
            dealtAndar[dealtAndar.length - 1] = matchedCard;
            setAndarCards([...dealtAndar]);
            turn = 'bahar'; // matches Andar side
          } else {
            dealtBahar[dealtBahar.length - 1] = matchedCard;
            setBaharCards([...dealtBahar]);
            turn = 'andar'; // matches Bahar side
          }
        }

        const matchSide: 'andar' | 'bahar' = (turn === 'bahar') ? 'andar' : 'bahar';
        
        let mult = 0;
        if (prediction === matchSide) {
          mult = matchSide === 'andar' ? 1.9 : 2.0;
        }

        const winnings = parseFloat((amt * mult).toFixed(2));
        settleBet(amt, winnings, 'Andar Bahar', mult);

        if (winnings > 0) {
          setMessage(`MATCH FOUND ON ${matchSide.toUpperCase()}! You won +$${winnings.toFixed(2)} (${mult}x)!`);
        } else {
          setMessage(`MATCH FOUND ON ${matchSide.toUpperCase()}! Settle wagers, dealer wins.`);
        }

        const histSymbol = matchSide === 'andar' ? 'A' : 'B';
        setHistory(prev => [...prev.slice(1), histSymbol]);

        setPlaying(false);
      }
    }, 450);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Dices className="text-neon-pink" size={24} /> Andar Bahar
        </h1>
        <p className="text-xs text-gray-400">Predict whether matching rank cards land on the Inside (Andar) or Outside (Bahar) side.</p>
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
              <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-2">Predict Side</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'andar', label: 'Andar (1.9x)', color: 'border-neon-pink/20 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink/50', activeColor: 'bg-neon-pink/15 border-neon-pink text-neon-pink shadow-neon-pink-glow' },
                  { id: 'bahar', label: 'Bahar (2.0x)', color: 'border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/50', activeColor: 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-neon-cyan-glow' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={playing}
                    onClick={() => { setPrediction(opt.id as any); setError(''); }}
                    className={`py-3 px-1 border rounded-xl text-center text-xs font-black transition-all ${
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
              <Play size={12} fill="currentColor" /> {playing ? 'Dealing...' : 'Play Andar Bahar'}
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
          <div className="absolute inset-0 z-0">
            <img
              src={andarBaharPoster}
              alt="Andar Bahar Poster"
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
                    hist === 'A'
                      ? 'bg-neon-pink/15 border border-neon-pink text-neon-pink shadow-neon-pink-glow'
                      : 'bg-neon-cyan/15 border border-neon-cyan text-neon-cyan shadow-neon-cyan-glow'
                  }`}
                >
                  {hist}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Joker Card */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-black text-neon-gold uppercase tracking-wider">GAME JOKER</span>
              <div className={`h-24 w-18 rounded-xl bg-white text-black border border-neon-gold flex flex-col justify-between p-2 select-none shadow-neon-gold-glow ${
                joker ? 'scale-100' : 'opacity-40 border-dashed bg-dark-900 text-gray-500'
              }`}>
                {joker ? (
                  <>
                    <div className="flex justify-between items-start font-bold text-xs">
                      <span>{joker.label}</span>
                      <span className={joker.color === 'red' ? 'text-red-505' : 'text-black'}>{joker.suit}</span>
                    </div>
                    <div className={`text-xl text-center ${joker.color === 'red' ? 'text-red-505' : 'text-black'}`}>{joker.suit}</div>
                    <div className="flex justify-between items-end font-bold text-xs rotate-180">
                      <span>{joker.label}</span>
                      <span className={joker.color === 'red' ? 'text-red-505' : 'text-black'}>{joker.suit}</span>
                    </div>
                  </>
                ) : (
                  <span className="h-full flex items-center justify-center text-[8px] font-black text-gray-650">?</span>
                )}
              </div>
            </div>

            {/* Board Columns: Andar vs Bahar */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              
              {/* Andar Side */}
              <div className="flex flex-col items-center bg-dark-900/40 p-3 rounded-2xl border border-neon-pink/10 h-44 overflow-y-auto">
                <span className="text-[10px] font-black text-neon-pink uppercase tracking-widest mb-2">Andar (Inside)</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {andarCards.map((card, idx) => (
                    <div key={idx} className="h-14 w-10 bg-white text-black border rounded-md flex flex-col justify-between p-1 select-none text-[10px] animate-scale-up">
                      <div className="flex justify-between items-start leading-none font-bold">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className="flex justify-between items-end leading-none font-bold rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bahar Side */}
              <div className="flex flex-col items-center bg-dark-900/40 p-3 rounded-2xl border border-neon-cyan/10 h-44 overflow-y-auto">
                <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-2">Bahar (Outside)</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {baharCards.map((card, idx) => (
                    <div key={idx} className="h-14 w-10 bg-white text-black border rounded-md flex flex-col justify-between p-1 select-none text-[10px] animate-scale-up">
                      <div className="flex justify-between items-start leading-none font-bold">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                      <div className="flex justify-between items-end leading-none font-bold rotate-180">
                        <span>{card.label}</span>
                        <span className={card.color === 'red' ? 'text-red-505' : 'text-black'}>{card.suit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>Andar pays 1.9x</span>
            <span>Bahar pays 2.0x</span>
          </div>
        </div>

      </div>
    </div>
  );
};

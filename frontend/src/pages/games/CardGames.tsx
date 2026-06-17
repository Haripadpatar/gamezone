import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Dices, Play, ShieldAlert } from 'lucide-react';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  score: number;
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: '2', score: 2 },
  { val: '3', score: 3 },
  { val: '4', score: 4 },
  { val: '5', score: 5 },
  { val: '6', score: 6 },
  { val: '7', score: 7 },
  { val: '8', score: 8 },
  { val: '9', score: 9 },
  { val: '10', score: 10 },
  { val: 'J', score: 10 },
  { val: 'Q', score: 10 },
  { val: 'K', score: 10 },
  { val: 'A', score: 11 }
];

export const CardGames: React.FC = () => {
  const { placeBet, settleBet } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'player_turn' | 'dealer_turn' | 'settled'>('betting');
  const [resultMsg, setResultMsg] = useState('');
  const [winStatus, setWinStatus] = useState<'win' | 'lose' | 'push' | null>(null);
  const [error, setError] = useState('');

  const generateDeck = (): Card[] => {
    const newDeck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(val => {
        newDeck.push({
          suit,
          value: val.val,
          score: val.score
        });
      });
    });
    // Shuffle
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateHandScore = (hand: Card[]): number => {
    let score = hand.reduce((acc, card) => acc + card.score, 0);
    let aces = hand.filter(c => c.value === 'A').length;

    // Adjust Aces from 11 to 1 if bust
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const handleStartGame = () => {
    setError('');
    setResultMsg('');
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

    const newDeck = generateDeck();
    // Deal hands
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(newDeck);
    setIsPlaying(true);
    
    const pScore = calculateHandScore(pHand);
    if (pScore === 21) {
      // Natural Blackjack!
      setGameState('dealer_turn');
      handleDealerReveal(dHand, pHand, newDeck, amt);
    } else {
      setGameState('player_turn');
    }
  };

  const handleHit = () => {
    if (gameState !== 'player_turn') return;

    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const updatedHand = [...playerHand, newCard];

    setPlayerHand(updatedHand);
    setDeck(newDeck);

    const score = calculateHandScore(updatedHand);
    if (score > 21) {
      // Player Bust!
      setIsPlaying(false);
      setGameState('settled');
      setWinStatus('lose');
      setResultMsg('Bust! Dealer wins.');
      settleBet(parseFloat(betSize), 0, 'Blackjack', 0);
    }
  };

  const handleStand = () => {
    if (gameState !== 'player_turn') return;
    setGameState('dealer_turn');
    handleDealerReveal(dealerHand, playerHand, deck, parseFloat(betSize));
  };

  const handleDealerReveal = (dHand: Card[], pHand: Card[], activeDeck: Card[], wager: number) => {
    let currentDealerHand = [...dHand];
    let currentDeck = [...activeDeck];

    let dScore = calculateHandScore(currentDealerHand);
    const pScore = calculateHandScore(pHand);

    // Dealer hits until score >= 17
    const drawDealerCards = () => {
      if (dScore < 17) {
        const nextCard = currentDeck.pop()!;
        currentDealerHand.push(nextCard);
        dScore = calculateHandScore(currentDealerHand);
        setDealerHand([...currentDealerHand]);
        setDeck([...currentDeck]);
        setTimeout(drawDealerCards, 600);
      } else {
        // Evaluate outcome
        evaluateWinner(pScore, dScore, wager);
      }
    };

    setTimeout(drawDealerCards, 600);
  };

  const evaluateWinner = (pScore: number, dScore: number, wager: number) => {
    let winMultiplier = 0;
    let status: typeof winStatus = 'lose';
    let msg = '';

    if (dScore > 21) {
      winMultiplier = 2.0;
      status = 'win';
      msg = 'Dealer Bust! You win.';
    } else if (pScore > dScore) {
      // Check for natural Blackjack
      const isBlackjack = pScore === 21 && playerHand.length === 2;
      winMultiplier = isBlackjack ? 2.5 : 2.0;
      status = 'win';
      msg = isBlackjack ? 'Blackjack! Premium payout.' : 'You win!';
    } else if (pScore === dScore) {
      winMultiplier = 1.0;
      status = 'push';
      msg = 'Push! Wager refunded.';
    } else {
      winMultiplier = 0;
      status = 'lose';
      msg = 'Dealer wins.';
    }

    const winnings = parseFloat((wager * winMultiplier).toFixed(2));
    settleBet(wager, winnings, 'Blackjack', winMultiplier);
    setWinStatus(status);
    setResultMsg(msg);
    setGameState('settled');
    setIsPlaying(false);
  };

  const pScore = calculateHandScore(playerHand);
  const dScore = gameState === 'player_turn' ? '?' : calculateHandScore(dealerHand);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Dices className="text-blue-400" size={24} /> Blackjack
        </h1>
        <p className="text-xs text-gray-400">Score as close to 21 as possible. Beat the dealer score without crossing 21.</p>
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
                disabled={isPlaying}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-450 disabled:opacity-50"
              />
            </div>
          </div>

          {gameState === 'betting' || gameState === 'settled' ? (
            <button
              onClick={handleStartGame}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-1.5 uppercase tracking-wider"
            >
              <Play size={14} fill="currentColor" /> Deal Hand
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleHit}
                disabled={gameState !== 'player_turn'}
                className="flex-1 py-2.5 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-black text-xs rounded-xl shadow-lg shadow-neon-cyan/15 uppercase tracking-wider disabled:opacity-50"
              >
                Hit
              </button>
              <button
                onClick={handleStand}
                disabled={gameState !== 'player_turn'}
                className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider disabled:opacity-50"
              >
                Stand
              </button>
            </div>
          )}

          {/* Result notice */}
          {resultMsg && (
            <div className={`p-3 rounded-xl border text-center text-xs font-bold animate-scale-up ${
              winStatus === 'win' ? 'bg-emerald-950/40 border-emerald-500/20 text-neon-emerald' :
              winStatus === 'push' ? 'bg-dark-900 border-dark-750 text-gray-400' :
              'bg-red-950/20 border-red-500/20 text-neon-pink'
            }`}>
              <div>{resultMsg}</div>
              {winStatus === 'win' && <div className="text-[10px] mt-1 font-extrabold">Received +${(parseFloat(betSize) * (playerHand.length === 2 && pScore === 21 ? 2.5 : 2.0)).toFixed(2)}</div>}
            </div>
          )}

        </div>

        {/* Board Display Panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 space-y-8 min-h-[350px]">
          
          <div className="w-full max-w-md space-y-8 relative">
            
            {/* Dealer Hand */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-550 font-bold uppercase tracking-wider">Dealer Hand</span>
                <span className="text-white font-extrabold bg-dark-900 border border-dark-750 px-2 py-0.5 rounded-lg">
                  Score: {dScore}
                </span>
              </div>
              
              <div className="flex gap-2.5 h-28 items-center bg-dark-950/40 p-3 rounded-xl border border-dark-850">
                {dealerHand.length === 0 ? (
                  <div className="text-[10px] text-gray-555 italic">Dealer is waiting...</div>
                ) : (
                  dealerHand.map((card, idx) => {
                    const hideCard = gameState === 'player_turn' && idx === 1;
                    const isRed = card.suit === '♥' || card.suit === '♦';
                    
                    return (
                      <div 
                        key={idx}
                        className={`h-full aspect-[2/3] rounded-lg border bg-white text-black p-2 flex flex-col justify-between shadow-lg relative select-none animate-scale-up ${
                          hideCard ? 'bg-gradient-to-br from-dark-800 to-dark-900 border-dark-650' : 'border-gray-300'
                        }`}
                      >
                        {hideCard ? (
                          <div className="absolute inset-0 flex items-center justify-center text-neon-cyan font-black text-lg">AG</div>
                        ) : (
                          <>
                            <div className={`text-xs font-bold leading-none ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                              {card.value}
                            </div>
                            <div className={`text-center text-2xl ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                              {card.suit}
                            </div>
                            <div className={`text-xs font-bold leading-none text-right rotate-180 ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                              {card.value}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Player Hand */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-550 font-bold uppercase tracking-wider">Your Hand</span>
                {playerHand.length > 0 && (
                  <span className="text-white font-extrabold bg-dark-900 border border-dark-750 px-2 py-0.5 rounded-lg">
                    Score: {pScore}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 h-28 items-center bg-dark-950/40 p-3 rounded-xl border border-dark-850">
                {playerHand.length === 0 ? (
                  <div className="text-[10px] text-gray-555 italic">Place bet size and deal cards to start.</div>
                ) : (
                  playerHand.map((card, idx) => {
                    const isRed = card.suit === '♥' || card.suit === '♦';
                    return (
                      <div 
                        key={idx}
                        className="h-full aspect-[2/3] rounded-lg border border-gray-300 bg-white text-black p-2 flex flex-col justify-between shadow-lg animate-scale-up select-none"
                      >
                        <div className={`text-xs font-bold leading-none ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                          {card.value}
                        </div>
                        <div className={`text-center text-2xl ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                          {card.suit}
                        </div>
                        <div className={`text-xs font-bold leading-none text-right rotate-180 ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                          {card.value}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

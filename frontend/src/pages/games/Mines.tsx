import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Bomb, Gem, Coins, Play, ShieldAlert, Sparkles } from 'lucide-react';

interface Tile {
  id: number;
  isMine: boolean;
  revealed: boolean;
}

export const Mines: React.FC = () => {
  const { placeBet, settleBet, houseRtp } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [minesCount, setMinesCount] = useState(3);
  const [board, setBoard] = useState<Tile[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gemsRevealed, setGemsRevealed] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [error, setError] = useState('');

  // Calculate next multiplier based on mines and gems revealed
  const getMultiplier = (mines: number, gems: number) => {
    if (gems === 0) return 1.0;
    
    // Provably fair odds simulation with House RTP factor
    let odds = 1.0;
    for (let i = 0; i < gems; i++) {
      odds *= (25 - mines - i) / (25 - i);
    }
    const rtpFactor = houseRtp / 100;
    return parseFloat(((1 / odds) * rtpFactor).toFixed(2));
  };

  const handleStartGame = () => {
    setError('');
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

    // Generate random mines
    const minePositions = new Set<number>();
    while (minePositions.size < minesCount) {
      minePositions.add(Math.floor(Math.random() * 25));
    }

    const newBoard = Array.from({ length: 25 }).map((_, idx) => ({
      id: idx,
      isMine: minePositions.has(idx),
      revealed: false
    }));

    setBoard(newBoard);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setGemsRevealed(0);
    setCurrentMultiplier(1.0);
  };

  const handleTileClick = (tileId: number) => {
    if (!gameStarted || gameOver || board[tileId].revealed) return;

    const updatedBoard = [...board];
    updatedBoard[tileId].revealed = true;
    setBoard(updatedBoard);

    if (updatedBoard[tileId].isMine) {
      // BOOM! Hit mine
      setGameOver(true);
      setGameStarted(false);
      // Settle bet as loss
      settleBet(parseFloat(betSize), 0, 'Mines', 0);
      revealAll();
    } else {
      // Clean Tile! Gem revealed
      const nextGems = gemsRevealed + 1;
      setGemsRevealed(nextGems);
      const nextMult = getMultiplier(minesCount, nextGems);
      setCurrentMultiplier(nextMult);

      // Check if all gems are revealed
      const totalGemsCount = 25 - minesCount;
      if (nextGems === totalGemsCount) {
        setGameWon(true);
        setGameOver(true);
        setGameStarted(false);
        const winAmt = parseFloat(betSize) * nextMult;
        settleBet(parseFloat(betSize), winAmt, 'Mines', nextMult);
        revealAll();
      }
    }
  };

  const handleCashout = () => {
    if (!gameStarted || gameOver || gemsRevealed === 0) return;

    setGameOver(true);
    setGameStarted(false);
    
    const winAmt = parseFloat(betSize) * currentMultiplier;
    settleBet(parseFloat(betSize), winAmt, 'Mines', currentMultiplier);
    revealAll();
  };

  const revealAll = () => {
    setBoard(prev => prev.map(t => ({ ...t, revealed: true })));
  };

  const nextPayout = getMultiplier(minesCount, gemsRevealed + 1);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bomb className="text-orange-500" size={24} /> Mines
        </h1>
        <p className="text-xs text-gray-400">Reveal hidden gemstone crystals and cash out before hitting a mine sweep.</p>
      </div>

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Play Panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5">
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
                disabled={gameStarted}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {['½', '2x', 'Max'].map(label => (
                <button
                  key={label}
                  type="button"
                  disabled={gameStarted}
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

          {/* Mines Count selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Mines Count</label>
            <select
              value={minesCount}
              disabled={gameStarted}
              onChange={(e) => setMinesCount(parseInt(e.target.value))}
              className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 font-bold"
            >
              {Array.from({ length: 24 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>{idx + 1} Mines</option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          {!gameStarted ? (
            <button
              onClick={handleStartGame}
              className="w-full py-2.5 bg-orange-550 hover:bg-orange-500 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-orange-550/15 flex justify-center items-center gap-1.5 uppercase tracking-wider"
            >
              <Play size={14} fill="currentColor" /> Place Bet
            </button>
          ) : (
            <button
              onClick={handleCashout}
              disabled={gemsRevealed === 0}
              className={`w-full py-2.5 rounded-xl font-black text-sm transition-all flex justify-center items-center gap-1.5 uppercase tracking-wider ${
                gemsRevealed > 0
                  ? 'bg-neon-emerald text-black shadow-lg shadow-neon-emerald/25 hover:opacity-90'
                  : 'bg-dark-800 text-gray-550 border border-dark-750 cursor-not-allowed'
              }`}
            >
              <Coins size={14} /> Cash Out
            </button>
          )}

          {/* Stats details panel */}
          {gameStarted && (
            <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Crystals Unlocked</span>
                <span className="font-bold text-white">{gemsRevealed} / {25 - minesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Multiplier Yield</span>
                <span className="font-extrabold text-neon-emerald">{currentMultiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between border-t border-dark-750 pt-1.5">
                <span className="text-gray-500">Current Payout</span>
                <span className="font-black text-neon-emerald">${(parseFloat(betSize) * currentMultiplier).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                <span>Next payout multiplier</span>
                <span>{nextPayout.toFixed(2)}x</span>
              </div>
            </div>
          )}

        </div>

        {/* Board Panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 relative">
          
          {/* Victory Overlay */}
          {gameOver && gameWon && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 rounded-2xl animate-fade-in p-4 text-center">
              <div className="p-3 bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald rounded-full mb-2 animate-bounce">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-black text-neon-emerald text-glow-emerald">WINNER!</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">
                Perfect Board sweep! Claimed payout of <span className="font-extrabold text-white">${(parseFloat(betSize) * currentMultiplier).toFixed(2)}</span> ({currentMultiplier}x).
              </p>
            </div>
          )}

          {/* Lose Overlay */}
          {gameOver && !gameWon && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 rounded-2xl animate-fade-in p-4 text-center">
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-500 rounded-full mb-2 animate-pulse">
                <Bomb size={32} />
              </div>
              <h3 className="text-xl font-black text-red-500">MINE EXPLODED</h3>
              <p className="text-xs text-gray-400 mt-1">Better luck next round! Adjusted wallet balance.</p>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-5 gap-2.5 max-w-sm w-full aspect-square">
            {board.length === 0 ? (
              // Empty/Inactive state placeholder grids
              Array.from({ length: 25 }).map((_, idx) => (
                <div 
                  key={idx}
                  className="bg-dark-900 border border-dark-750/70 rounded-xl w-full aspect-square flex items-center justify-center opacity-40"
                />
              ))
            ) : (
              board.map(tile => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={!gameStarted || gameOver || tile.revealed}
                  className={`
                    w-full aspect-square rounded-xl transition-all duration-300 font-bold border flex items-center justify-center
                    ${!tile.revealed 
                      ? 'bg-dark-800 hover:bg-dark-700 border-dark-700 cursor-pointer shadow-md' 
                      : tile.isMine 
                      ? 'bg-red-950/60 border-red-500/40 text-red-500 shadow-neon-pink' 
                      : 'bg-emerald-950/60 border-emerald-500/40 text-neon-emerald shadow-neon-emerald'
                    }
                  `}
                >
                  {tile.revealed ? (
                    tile.isMine ? <Bomb size={22} className="animate-scale-up" /> : <Gem size={22} className="animate-scale-up" />
                  ) : (
                    <span className="opacity-0 group-hover:opacity-10 text-[10px]">?</span>
                  )}
                </button>
              ))
            )}
          </div>
          
        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Wallet, Play, Sparkles, AlertCircle, Gamepad2 } from 'lucide-react';
import ludoPoster from '../../assets/ludo.png';

interface Coordinate {
  x: number;
  y: number;
}

// Circular 52-cell track path coordinates starting at Blue's starting point (6, 13)
const TRACK_PATH: Coordinate[] = [
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  { x: 5, y: 8 },  { x: 4, y: 8 },  { x: 3, y: 8 },  { x: 2, y: 8 },  { x: 1, y: 8 },  { x: 0, y: 8 },
  { x: 0, y: 7 },
  { x: 0, y: 6 },  { x: 1, y: 6 },  { x: 2, y: 6 },  { x: 3, y: 6 },  { x: 4, y: 6 },  { x: 5, y: 6 },
  { x: 6, y: 5 },  { x: 6, y: 4 },  { x: 6, y: 3 },  { x: 6, y: 2 },  { x: 6, y: 1 },  { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 8, y: 0 },  { x: 8, y: 1 },  { x: 8, y: 2 },  { x: 8, y: 3 },  { x: 8, y: 4 },  { x: 8, y: 5 },
  { x: 9, y: 6 },  { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  { x: 14, y: 7 },
  { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  { x: 8, y: 9 },  { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  { x: 7, y: 14 },
  { x: 6, y: 14 }
];

const SAFE_SPOTS: Coordinate[] = [
  { x: 6, y: 13 }, { x: 1, y: 6 }, { x: 8, y: 1 }, { x: 13, y: 8 },
  { x: 8, y: 12 }, { x: 12, y: 6 }, { x: 6, y: 2 }, { x: 2, y: 8 }
];

export const Ludo: React.FC = () => {
  const { balanceMode, mainBalance, practiceBalance, placeBet, settleBet } = useGame();
  const [betSize, setBetSize] = useState('10');
  const [gameStage, setGameStage] = useState<'idle' | 'player_turn' | 'bot1_turn' | 'bot2_turn' | 'bot3_turn' | 'win' | 'lose'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Player token positions (-1: Home base, 0..50: circular track, 51..56: home stretch, 57: Finished)
  const [bluePos, setBluePos] = useState(-1); // Player
  const [redPos, setRedPos] = useState(-1);   // Bot 1
  const [greenPos, setGreenPos] = useState(-1); // Bot 2
  const [yellowPos, setYellowPos] = useState(-1); // Bot 3

  const [diceVal, setDiceVal] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const currentBalance = balanceMode === 'REAL' ? mainBalance : practiceBalance;

  // Resolve coordinate location for each player/bot on the 15x15 board
  const getTokenCoordinates = (player: 'blue' | 'red' | 'green' | 'yellow', pos: number): Coordinate => {
    if (pos === -1) {
      // Home base coordinates
      if (player === 'blue') return { x: 2, y: 12 };
      if (player === 'red') return { x: 2, y: 2 };
      if (player === 'green') return { x: 12, y: 2 };
      return { x: 12, y: 12 };
    }

    if (pos === 57) {
      // Finish cells
      if (player === 'blue') return { x: 7, y: 8 };
      if (player === 'red') return { x: 6, y: 7 };
      if (player === 'green') return { x: 7, y: 6 };
      return { x: 8, y: 7 };
    }

    if (pos >= 51 && pos <= 56) {
      // Colored home stretches
      const steps = pos - 50;
      if (player === 'blue') return { x: 7, y: 14 - steps };
      if (player === 'red') return { x: steps, y: 7 };
      if (player === 'green') return { x: 7, y: steps };
      return { x: 14 - steps, y: 7 };
    }

    // Circular track coordinates with appropriate offset indices
    let offset = 0;
    if (player === 'blue') offset = 0;
    else if (player === 'red') offset = 13;
    else if (player === 'green') offset = 26;
    else if (player === 'yellow') offset = 39;

    const trackIndex = (pos + offset) % 52;
    return TRACK_PATH[trackIndex];
  };

  const handleStartLudo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (gameStage !== 'idle') return;

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
      setError('Failed to deduct wager.');
      return;
    }

    // Reset board
    setBluePos(-1);
    setRedPos(-1);
    setGreenPos(-1);
    setYellowPos(-1);
    setDiceVal(null);
    setGameStage('player_turn');
    setMessage('Stakes placed! Your turn to roll the dice.');
  };

  const simulateDiceRoll = (): Promise<number> => {
    return new Promise((resolve) => {
      setRolling(true);
      let rollsCount = 0;
      const interval = setInterval(() => {
        setDiceVal(Math.floor(Math.random() * 6) + 1);
        rollsCount++;
        if (rollsCount >= 8) {
          clearInterval(interval);
          const finalVal = Math.floor(Math.random() * 6) + 1;
          setDiceVal(finalVal);
          setRolling(false);
          resolve(finalVal);
        }
      }, 100);
    });
  };

  // Check if landing spot kicks an opponent back to base (if not on safe spots)
  const evaluateKicks = (player: 'blue' | 'red' | 'green' | 'yellow', targetPos: number) => {
    if (targetPos === -1 || targetPos === 57 || targetPos > 50) return;

    const targetCoord = getTokenCoordinates(player, targetPos);
    
    // Check if landing spot is a safe spot
    const isSafe = SAFE_SPOTS.some(s => s.x === targetCoord.x && s.y === targetCoord.y);
    if (isSafe) return;

    // Kick Blue
    if (player !== 'blue' && bluePos >= 0 && bluePos <= 50) {
      const coord = getTokenCoordinates('blue', bluePos);
      if (coord.x === targetCoord.x && coord.y === targetCoord.y) {
        setBluePos(-1);
        setMessage(prev => prev + ' blue token kicked back to base!');
      }
    }
    // Kick Red
    if (player !== 'red' && redPos >= 0 && redPos <= 50) {
      const coord = getTokenCoordinates('red', redPos);
      if (coord.x === targetCoord.x && coord.y === targetCoord.y) {
        setRedPos(-1);
        setMessage(prev => prev + ' Red token kicked back to base!');
      }
    }
    // Kick Green
    if (player !== 'green' && greenPos >= 0 && greenPos <= 50) {
      const coord = getTokenCoordinates('green', greenPos);
      if (coord.x === targetCoord.x && coord.y === targetCoord.y) {
        setGreenPos(-1);
        setMessage(prev => prev + ' Green token kicked back to base!');
      }
    }
    // Kick Yellow
    if (player !== 'yellow' && yellowPos >= 0 && yellowPos <= 50) {
      const coord = getTokenCoordinates('yellow', yellowPos);
      if (coord.x === targetCoord.x && coord.y === targetCoord.y) {
        setYellowPos(-1);
        setMessage(prev => prev + ' Yellow token kicked back to base!');
      }
    }
  };

  // Player Roll Action
  const handlePlayerRoll = async () => {
    if (rolling || gameStage !== 'player_turn') return;

    const roll = await simulateDiceRoll();
    
    let nextPos = bluePos;
    if (bluePos === -1) {
      nextPos = 0; // exit base
    } else {
      nextPos = bluePos + roll;
    }

    if (nextPos > 57) {
      // Exact roll required to finish
      setMessage(`You rolled a ${roll}, but need exact count to finish. No move.`);
      setGameStage('bot1_turn');
      return;
    }

    setBluePos(nextPos);
    setMessage(`You rolled a ${roll}! Token advanced.`);
    evaluateKicks('blue', nextPos);

    if (nextPos === 57) {
      const amt = parseFloat(betSize);
      const winnings = amt * 3;
      settleBet(amt, winnings, 'Ludo', 3.0);
      setGameStage('win');
      setMessage(`CONGRATULATIONS! You hit the finish zone and won $${winnings.toFixed(2)}!`);
      return;
    }

    setGameStage('bot1_turn');
  };

  // Auto trigger Bot turns sequentially
  useEffect(() => {
    if (gameStage === 'idle' || gameStage === 'win' || gameStage === 'lose' || gameStage === 'player_turn' || rolling) return;

    const triggerBotTurn = async (bot: 'red' | 'green' | 'yellow', currentPos: number, setPos: React.Dispatch<React.SetStateAction<number>>, nextStage: 'idle' | 'player_turn' | 'bot1_turn' | 'bot2_turn' | 'bot3_turn' | 'win' | 'lose') => {
      const roll = await simulateDiceRoll();

      let nextPos = currentPos;
      if (currentPos === -1) {
        nextPos = 0;
      } else {
        nextPos = currentPos + roll;
      }

      if (nextPos > 57) {
        setMessage(`${bot.toUpperCase()} rolled a ${roll}, but needs exact count. Stands.`);
        setGameStage(nextStage);
        return;
      }

      setPos(nextPos);
      setMessage(`${bot.toUpperCase()} rolled a ${roll} and advanced.`);
      evaluateKicks(bot, nextPos);

      if (nextPos === 57) {
        const amt = parseFloat(betSize);
        settleBet(amt, 0, 'Ludo', 0);
        setGameStage('lose');
        setMessage(`ROUND OVER: ${bot.toUpperCase()} reached finish zone first! Better luck next time.`);
        return;
      }

      setGameStage(nextStage);
    };

    const timer = setTimeout(() => {
      if (gameStage === 'bot1_turn') {
        triggerBotTurn('red', redPos, setRedPos, 'bot2_turn');
      } else if (gameStage === 'bot2_turn') {
        triggerBotTurn('green', greenPos, setGreenPos, 'bot3_turn');
      } else if (gameStage === 'bot3_turn') {
        triggerBotTurn('yellow', yellowPos, setYellowPos, 'player_turn');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameStage, rolling]);

  const getCellColor = (x: number, y: number): string => {
    // Bases
    if (x < 6 && y < 6) return 'bg-red-950/40 border border-red-500/25';
    if (x > 8 && y < 6) return 'bg-emerald-950/40 border border-emerald-500/25';
    if (x < 6 && y > 8) return 'bg-blue-950/40 border border-blue-500/25';
    if (x > 8 && y > 8) return 'bg-amber-950/40 border border-amber-500/25';

    // Center Home
    if (x >= 6 && x <= 8 && y >= 6 && y <= 8) return 'bg-dark-800 border border-neon-gold/30';

    // Home corridors
    if (x === 7 && y > 8 && y < 14) return 'bg-blue-900/60 border border-blue-500/30';
    if (x === 7 && y > 0 && y < 6) return 'bg-emerald-900/60 border border-emerald-500/30';
    if (y === 7 && x > 0 && x < 6) return 'bg-red-900/60 border border-red-500/30';
    if (y === 7 && x > 8 && x < 14) return 'bg-amber-900/60 border border-amber-500/30';

    // Safe Spots
    const isSafe = SAFE_SPOTS.some(s => s.x === x && s.y === y);
    if (isSafe) return 'bg-dark-750 border border-neon-gold/20 shadow-neon-gold-glow';

    return 'bg-dark-900/80 border border-dark-800/60';
  };

  // Check which token sits on cell (x, y)
  const renderTokens = (x: number, y: number) => {
    const tokens: React.ReactNode[] = [];
    const blueCoord = getTokenCoordinates('blue', bluePos);
    const redCoord = getTokenCoordinates('red', redPos);
    const greenCoord = getTokenCoordinates('green', greenPos);
    const yellowCoord = getTokenCoordinates('yellow', yellowPos);

    if (blueCoord.x === x && blueCoord.y === y) {
      tokens.push(
        <div key="blue" className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-neon-cyan-glow border border-white animate-scale-up" />
      );
    }
    if (redCoord.x === x && redCoord.y === y) {
      tokens.push(
        <div key="red" className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-neon-pink-glow border border-white animate-scale-up" />
      );
    }
    if (greenCoord.x === x && greenCoord.y === y) {
      tokens.push(
        <div key="green" className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-neon-gold-glow border border-white animate-scale-up" />
      );
    }
    if (yellowCoord.x === x && yellowCoord.y === y) {
      tokens.push(
        <div key="yellow" className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-neon-gold-glow border border-white animate-scale-up" />
      );
    }

    if (tokens.length === 0) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5">
        {tokens}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Gamepad2 className="text-neon-cyan" size={24} /> Ludo
        </h1>
        <p className="text-xs text-gray-400">Roll the dice, race tokens, and win multipliers in the classic board game.</p>
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

          {gameStage === 'idle' || gameStage === 'win' || gameStage === 'lose' ? (
            <form onSubmit={handleStartLudo} className="space-y-4">
              {/* Bet size */}
              <div>
                <label className="block text-[10px] text-gray-555 uppercase font-black tracking-wider mb-1.5">Game Stake ($)</label>
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
                <Play size={12} fill="currentColor" /> {gameStage === 'idle' ? 'Start Ludo Match' : 'Play Again'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Active stakes display */}
              <div className="p-3 bg-dark-900 border border-dark-800 rounded-xl text-center space-y-1.5">
                <span className="text-[10px] font-black uppercase text-gray-550">Turn Indicator</span>
                <div className={`text-xs font-black uppercase ${gameStage === 'player_turn' ? 'text-neon-cyan text-glow-cyan' : 'text-neon-pink'}`}>
                  {gameStage === 'player_turn' ? 'Your Turn' : `${gameStage.replace('_turn', '').toUpperCase()} is rolling`}
                </div>
              </div>

              {/* Dice roll animation area */}
              <div className="flex flex-col items-center gap-3 py-4 bg-dark-900/40 border border-dark-850 rounded-xl relative overflow-hidden">
                {diceVal !== null && (
                  <div className={`w-14 h-14 bg-white text-black border-2 border-neon-gold shadow-neon-gold-glow rounded-xl flex items-center justify-center text-2xl font-black transition-all ${rolling ? 'animate-bounce' : ''}`}>
                    {diceVal}
                  </div>
                )}
                <button
                  type="button"
                  disabled={gameStage !== 'player_turn' || rolling}
                  onClick={handlePlayerRoll}
                  className="py-2 px-6 bg-cyber-gradient text-white font-black text-xs rounded-xl hover:opacity-95 transition-all shadow-md disabled:opacity-50"
                >
                  {rolling ? 'Rolling...' : 'Roll Dice'}
                </button>
              </div>
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

        {/* Live Simulation Arena (Board) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 overflow-hidden relative min-h-[380px] md:h-[480px] flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0">
            <img
              src={ludoPoster}
              alt="Ludo Poster"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950 to-dark-950" />
          </div>

          {/* Styled Board Area */}
          <div className="relative z-10 flex-1 flex items-center justify-center my-2">
            <div
              className="w-full max-w-[320px] md:max-w-[380px] aspect-square gap-[1px] bg-dark-800 border-2 border-dark-750/80 rounded-2xl overflow-hidden relative p-[1px]"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(15, minmax(0, 1fr))'
              }}
            >
              {Array.from({ length: 15 }).map((_, y) => (
                Array.from({ length: 15 }).map((__, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`relative w-full h-full flex items-center justify-center transition-all ${getCellColor(x, y)}`}
                  >
                    {/* Render colored bases centers tags */}
                    {x === 2 && y === 2 && redPos === -1 && (
                      <span className="text-[7.5px] font-black text-red-500 uppercase tracking-widest leading-none absolute">RED</span>
                    )}
                    {x === 12 && y === 2 && greenPos === -1 && (
                      <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest leading-none absolute">GRN</span>
                    )}
                    {x === 2 && y === 12 && bluePos === -1 && (
                      <span className="text-[7.5px] font-black text-neon-cyan uppercase tracking-widest leading-none absolute">BLUE</span>
                    )}
                    {x === 12 && y === 12 && yellowPos === -1 && (
                      <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest leading-none absolute">YLW</span>
                    )}

                    {/* Render active tokens inside cells */}
                    {renderTokens(x, y)}
                  </div>
                ))
              ))}
            </div>
          </div>

          {/* Bottom stats disclaimer */}
          <div className="relative z-10 flex justify-between items-center text-[8.5px] uppercase font-bold tracking-widest text-gray-550 border-t border-dark-800/60 pt-3">
            <span>RNG rolls certified</span>
            <span>First player to finish wins 3x payout</span>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Flame, Play, ShieldAlert, Sparkles, Coins } from 'lucide-react';

interface PlayerCashout {
  username: string;
  mult: number;
  win: number;
}

export const Crash: React.FC = () => {
  const { placeBet, settleBet, houseRtp } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(0);
  const [error, setError] = useState('');
  
  const [otherPlayers, setOtherPlayers] = useState<PlayerCashout[]>([]);
  const crashPointRef = useRef(1.00);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#151A22';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      // Y lines
      const y = height - (i * height / 5);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // X lines
      const x = 40 + (i * (width - 40) / 5);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
    }

    // Draw border lines
    ctx.strokeStyle = '#2B3544';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width, height - 30);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px monospace';
    ctx.fillText('0s', 40, height - 15);
    ctx.fillText('2s', 40 + (width - 40) * 0.25, height - 15);
    ctx.fillText('4s', 40 + (width - 40) * 0.5, height - 15);
    ctx.fillText('6s', 40 + (width - 40) * 0.75, height - 15);

    ctx.fillText('1.0x', 8, height - 28);
    ctx.fillText('2.0x', 8, height - 30 - (height - 30) * 0.25);
    ctx.fillText('4.0x', 8, height - 30 - (height - 30) * 0.5);
    ctx.fillText('8.0x', 8, height - 30 - (height - 30) * 0.75);

    if (gameState === 'running') {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      // Arc coordinates
      const startX = 40;
      const startY = height - 30;
      
      const pX = Math.min(width - 20, startX + elapsed * (width - 60) / 6);
      const pY = Math.max(20, startY - (Math.pow(multiplier - 1.0, 0.7) * (height - 60) / 3));

      // Draw curve line
      const grad = ctx.createLinearGradient(startX, startY, pX, pY);
      grad.addColorStop(0, '#BD00FF');
      grad.addColorStop(1, '#00F0FF');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00F0FF';
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      // Quadratic bezier curve
      ctx.quadraticCurveTo((startX + pX) / 2, startY, pX, pY);
      ctx.stroke();
      
      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw rocket head dot
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(pX, pY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rocket flame glow
      ctx.fillStyle = '#FF007F';
      ctx.beginPath();
      ctx.arc(pX - 6, pY + 3, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (gameState === 'crashed') {
      // Draw crash explosion
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const startX = 40;
      const startY = height - 30;
      const pX = Math.min(width - 20, startX + elapsed * (width - 60) / 6);
      const pY = Math.max(20, startY - (Math.pow(multiplier - 1.0, 0.7) * (height - 60) / 3));

      ctx.fillStyle = '#FF007F';
      ctx.beginPath();
      ctx.arc(pX, pY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('CRASHED', pX - 25, pY - 20);
    }
  }, [gameState, multiplier]);

  // Game loop tick
  const tick = () => {
    if (gameState !== 'running') return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    // Exponential climbing multiplier curve
    const currentMult = parseFloat((Math.pow(1.08, elapsed)).toFixed(2));
    
    if (currentMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('crashed');
      // Settle wagers
      if (!hasCashedOut) {
        settleBet(parseFloat(betSize), 0, 'Crash', 0);
      }
    } else {
      setMultiplier(currentMult);
      
      // Simulate other players cashing out randomly
      if (Math.random() > 0.95 && otherPlayers.length < 8) {
        const bots = ['CryptoNinja', 'DiceKing', 'MegaWinner', 'SpinQueen', 'ApexPredator', 'LootKing'];
        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        // Check if not already in list
        if (!otherPlayers.some(p => p.username === randomBot)) {
          const win = Math.floor(Math.random() * 200) + 10;
          setOtherPlayers(prev => [...prev, { username: randomBot, mult: currentMult, win }]);
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (gameState === 'running') {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, hasCashedOut]);

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

    // Mathematical formula factoring house edge RTP
    // 0.98 is normal base multiplier. RTP translates into crash odds
    const rtpFactor = houseRtp / 100;
    const r = Math.random();
    const generatedCrash = Math.max(1.01, parseFloat((rtpFactor / (1.0 - r)).toFixed(2)));
    
    // Set variables
    crashPointRef.current = generatedCrash;
    startTimeRef.current = Date.now();
    setMultiplier(1.00);
    setHasCashedOut(false);
    setCashoutMult(0);
    setOtherPlayers([]);
    setGameState('running');
  };

  const handleCashout = () => {
    if (gameState !== 'running' || hasCashedOut) return;

    setHasCashedOut(true);
    setCashoutMult(multiplier);
    
    const winAmt = parseFloat(betSize) * multiplier;
    settleBet(parseFloat(betSize), winAmt, 'Crash', multiplier);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Flame className="text-neon-pink" size={24} /> Crash Rocket
        </h1>
        <p className="text-xs text-gray-400">Place wagers, watch the rocket multiplier climb, and cash out before the explosion.</p>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Play Controls */}
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
                disabled={gameState === 'running'}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-pink disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Trigger */}
          {gameState !== 'running' ? (
            <button
              onClick={handleStartGame}
              className="w-full py-2.5 bg-neon-pink hover:bg-neon-pink/85 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-neon-pink/15 flex justify-center items-center gap-1.5 uppercase tracking-wider"
            >
              <Play size={14} fill="currentColor" /> Launch Rocket
            </button>
          ) : (
            <button
              onClick={handleCashout}
              disabled={hasCashedOut}
              className={`w-full py-2.5 rounded-xl font-black text-sm transition-all flex justify-center items-center gap-1.5 uppercase tracking-wider ${
                !hasCashedOut
                  ? 'bg-neon-emerald text-black shadow-lg shadow-neon-emerald/25 hover:opacity-90'
                  : 'bg-dark-800 text-gray-500 border border-dark-750 cursor-not-allowed'
              }`}
            >
              <Coins size={14} /> {hasCashedOut ? `Cashed Out at ${cashoutMult}x` : 'Cash Out'}
            </button>
          )}

          {/* Settle Details */}
          {gameState === 'running' && (
            <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Live Multiplier</span>
                <span className="font-extrabold text-neon-pink">{multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wager Returns</span>
                <span className="font-black text-neon-emerald">${(parseFloat(betSize) * multiplier).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Other players ticker */}
          <div className="border-t border-dark-750 pt-3 space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Other Player Cashouts</h4>
            {otherPlayers.length === 0 ? (
              <div className="text-[10px] text-gray-550 italic py-2">Waiting for launches...</div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {otherPlayers.map((player, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] bg-dark-900/40 p-1.5 rounded-lg border border-dark-800">
                    <span className="text-gray-300 font-semibold">{player.username}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-cyan font-bold">{player.mult.toFixed(2)}x</span>
                      <span className="text-neon-emerald font-black">+${player.win}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Canvas visual center */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 relative">
          
          {/* Large text indicators overlay */}
          <div className="absolute top-10 left-10 z-10 flex flex-col">
            {gameState === 'running' && (
              <div className="text-5xl md:text-6xl font-black text-white text-glow-purple tracking-tighter animate-scale-up">
                {multiplier.toFixed(2)}x
              </div>
            )}
            {gameState === 'crashed' && (
              <div className="space-y-1 animate-scale-up">
                <div className="text-red-500 font-black text-4xl">CRASHED @ {multiplier.toFixed(2)}x</div>
                <div className="text-xs text-gray-500">Rocket exploded. Better luck next time!</div>
              </div>
            )}
            {gameState === 'idle' && (
              <div className="space-y-1">
                <div className="text-2xl font-black text-gray-400 uppercase tracking-wide">Ready for Launch</div>
                <div className="text-[10px] text-gray-550">Place your bet size and click launch.</div>
              </div>
            )}

            {/* User Cashout overlay */}
            {hasCashedOut && gameState === 'running' && (
              <div className="mt-3 px-3 py-1 bg-neon-emerald/15 border border-neon-emerald/30 text-neon-emerald rounded-lg text-xs font-black flex items-center gap-1.5 w-max animate-bounce">
                <Sparkles size={12} /> Claimed at {cashoutMult.toFixed(2)}x
              </div>
            )}
          </div>

          {/* HTML5 Canvas */}
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={350} 
            className="w-full aspect-[600/350] bg-dark-950/60 rounded-xl"
          />

        </div>

      </div>

    </div>
  );
};

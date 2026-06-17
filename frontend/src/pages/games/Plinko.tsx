import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Gamepad2, Play, ShieldAlert, Sparkles } from 'lucide-react';

const MULTIPLIERS = [8.0, 3.0, 1.5, 0.3, 0.3, 1.5, 3.0, 8.0];

export const Plinko: React.FC = () => {
  const { placeBet, settleBet } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState('');
  const [winningsMsg, setWinningsMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Constants for drawing the Plinko board
  const ROWS = 8;
  const PEG_RADIUS = 3;
  const BALL_RADIUS = 6;

  useEffect(() => {
    drawBoard();
  }, []);

  const drawBoard = (ballPos?: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw pegs (triangular peg board)
    ctx.fillStyle = '#6B7280';
    for (let r = 0; r < ROWS; r++) {
      const pinsCount = r + 3;
      const y = 50 + r * (h - 120) / ROWS;
      const rowWidth = pinsCount * 24;
      const startX = (w - rowWidth) / 2 + 12;

      for (let c = 0; c < pinsCount; c++) {
        const x = startX + c * 24;
        ctx.beginPath();
        ctx.arc(x, y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw multiplier buckets at the bottom
    const bucketY = h - 50;
    const bucketWidth = 32;
    const totalBuckets = MULTIPLIERS.length;
    const startX = (w - totalBuckets * bucketWidth) / 2;

    MULTIPLIERS.forEach((mult, idx) => {
      const x = startX + idx * bucketWidth;

      // Color coding buckets based on multipliers
      ctx.fillStyle = mult >= 3.0 ? '#FF007F' : mult >= 1.5 ? '#BD00FF' : '#151A22';
      ctx.fillRect(x + 2, bucketY, bucketWidth - 4, 30);

      ctx.strokeStyle = '#2B3544';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, bucketY, bucketWidth - 4, 30);

      ctx.fillStyle = mult >= 1.5 ? '#FFFFFF' : '#9CA3AF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${mult}x`, x + bucketWidth / 2, bucketY + 18);
    });

    // Draw ball if active
    if (ballPos) {
      ctx.fillStyle = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00F0FF';
      ctx.beginPath();
      ctx.arc(ballPos.x, ballPos.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  };

  const handleDropBall = () => {
    setError('');
    setWinningsMsg('');

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

    setDropping(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Pre-calculate path nodes (bounces)
    const path: Array<{ x: number; y: number }> = [];
    let curX = w / 2;
    let curY = 20;
    path.push({ x: curX, y: curY });

    // Simulate choice indices (Left/Right) at each peg row
    let slotIdx = 0;
    for (let r = 0; r < ROWS; r++) {
      const pinsCount = r + 3;
      const targetY = 50 + r * (h - 120) / ROWS;
      const rowWidth = pinsCount * 24;
      const startX = (w - rowWidth) / 2 + 12;

      // Randomly choose bounce left (0) or right (1)
      const goRight = Math.random() > 0.5;
      if (goRight) slotIdx++;

      // Next peg coordinate target
      const targetX = startX + slotIdx * 24 + (goRight ? -12 : 12);
      
      // Interpolate mid-bounce heights
      const steps = 8;
      for (let s = 1; s <= steps; s++) {
        const intermediateY = curY + (targetY - curY) * (s / steps);
        // Add horizontal sway bounce arc
        const ratio = s / steps;
        const sway = Math.sin(ratio * Math.PI) * (goRight ? 6 : -6);
        const intermediateX = curX + (targetX - curX) * ratio + sway;
        path.push({ x: intermediateX, y: intermediateY });
      }

      curX = targetX;
      curY = targetY;
    }

    // Drop into final bucket slot coordinates
    const bucketY = h - 50;
    const bucketWidth = 32;
    const bucketsStartX = (w - MULTIPLIERS.length * bucketWidth) / 2;
    const finalX = bucketsStartX + slotIdx * bucketWidth + bucketWidth / 2;

    const finalSteps = 6;
    for (let s = 1; s <= finalSteps; s++) {
      path.push({
        x: curX + (finalX - curX) * (s / finalSteps),
        y: curY + (bucketY - curY) * (s / finalSteps)
      });
    }

    // Animate ball along calculated nodes path
    let pathIdx = 0;
    const animate = () => {
      if (pathIdx < path.length) {
        drawBoard(path[pathIdx]);
        pathIdx++;
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished
        cancelAnimationFrame(animationFrameRef.current);
        const multiplier = MULTIPLIERS[slotIdx];
        
        const winnings = parseFloat((amt * multiplier).toFixed(2));
        settleBet(amt, winnings, 'Plinko', multiplier);

        if (winnings > 0) {
          setWinningsMsg(`Landed! Won +$${winnings.toFixed(2)} (${multiplier}x)`);
        } else {
          setWinningsMsg(`Landed! Received $${winnings.toFixed(2)} (${multiplier}x)`);
        }

        setDropping(false);
        drawBoard(); // Reset board visual
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Gamepad2 className="text-neon-cyan" size={24} /> Plinko Drop
        </h1>
        <p className="text-xs text-gray-400">Release ball drops into the peg matrix and collect winnings in bottom multiplier buckets.</p>
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
                disabled={dropping}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-cyan disabled:opacity-50"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {['½', '2x', 'Max'].map(label => (
                <button
                  key={label}
                  type="button"
                  disabled={dropping}
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

          <button
            onClick={handleDropBall}
            disabled={dropping}
            className="w-full py-2.5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-neon-cyan/25 flex justify-center items-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" /> Drop Ball
          </button>

          {/* Outcome notification */}
          {winningsMsg && (
            <div className="p-3 bg-dark-900 border border-dark-750 text-center text-xs font-bold text-white rounded-xl animate-scale-up">
              <div className="flex items-center justify-center gap-1 text-neon-emerald">
                <Sparkles size={14} />
                <span>{winningsMsg}</span>
              </div>
            </div>
          )}

        </div>

        {/* Display Center */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 relative">
          
          <canvas 
            ref={canvasRef} 
            width={450} 
            height={380} 
            className="w-full aspect-[450/380] bg-dark-950/60 rounded-xl"
          />

        </div>

      </div>

    </div>
  );
};

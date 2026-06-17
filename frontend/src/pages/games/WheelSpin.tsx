import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { RotateCcw, Play, ShieldAlert, Sparkles } from 'lucide-react';

const SEGMENTS = [
  { label: '0x', mult: 0, color: 'bg-dark-800 text-gray-500' },
  { label: '1.2x', mult: 1.2, color: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/20' },
  { label: '0.5x', mult: 0.5, color: 'bg-dark-800 text-gray-400' },
  { label: '2.0x', mult: 2.0, color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/20' },
  { label: '0.2x', mult: 0.2, color: 'bg-dark-800 text-gray-500' },
  { label: '1.5x', mult: 1.5, color: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/20' },
  { label: '0.8x', mult: 0.8, color: 'bg-dark-800 text-gray-450' },
  { label: '5.0x', mult: 5.0, color: 'bg-neon-pink/20 text-neon-pink border-neon-pink/20 text-glow-pink' }
];

export const WheelSpin: React.FC = () => {
  const { placeBet, settleBet } = useGame();
  
  const [betSize, setBetSize] = useState('10');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningsMsg, setWinningsMsg] = useState('');
  const [error, setError] = useState('');

  const handleSpinWheel = () => {
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

    setSpinning(true);

    // Pick random target segment index
    const targetIdx = Math.floor(Math.random() * SEGMENTS.length);

    // Calculate rotation: Spin 5 full turns (1800 deg) plus slice offsets
    // Slice angle size is 360 / segments length
    const sliceAngle = 360 / SEGMENTS.length;
    // Align wheel so arrow at top (270 deg offset adjustment) points to target
    const targetAngle = 1800 + (SEGMENTS.length - targetIdx) * sliceAngle - sliceAngle / 2;

    setRotation(targetAngle);

    // Settle winnings after CSS spin animation finishes (3 seconds)
    setTimeout(() => {
      setSpinning(false);
      const segment = SEGMENTS[targetIdx];
      const winnings = parseFloat((amt * segment.mult).toFixed(2));

      settleBet(amt, winnings, 'Wheel Spin', segment.mult);

      if (winnings > 0) {
        setWinningsMsg(`Prize won: +$${winnings.toFixed(2)} (${segment.label} multiplier)`);
      } else {
        setWinningsMsg(`No win. Landing segment: ${segment.label}`);
      }
    }, 3200);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <RotateCcw className="text-purple-400" size={24} /> Wheel Spin
        </h1>
        <p className="text-xs text-gray-400">Spin the premium wheel of fortune segments to unlock payout bonuses.</p>
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
                disabled={spinning}
                onChange={(e) => setBetSize(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-purple-400 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            onClick={handleSpinWheel}
            disabled={spinning}
            className="w-full py-2.5 bg-cyber-gradient text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-neon-purple/20 flex justify-center items-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" /> Spin Wheel
          </button>

          {winningsMsg && (
            <div className="p-3 bg-dark-900 border border-dark-750 text-center text-xs font-bold text-white rounded-xl animate-scale-up">
              <div className="flex items-center justify-center gap-1 text-neon-cyan">
                <Sparkles size={14} />
                <span>{winningsMsg}</span>
              </div>
            </div>
          )}

        </div>

        {/* Wheel Display Panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center glass-panel rounded-2xl border border-dark-700/60 p-6 relative min-h-[350px]">
          
          {/* Wheel Frame */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 select-none">
            
            {/* Top Indicator Arrow pointer */}
            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-neon-pink drop-shadow-lg" />

            {/* Rotator container */}
            <div 
              style={{
                transform: `rotate(${-rotation}deg)`,
                transition: spinning ? 'transform 3.2s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
              }}
              className="w-full h-full rounded-full border-4 border-dark-700 shadow-2xl relative overflow-hidden bg-dark-950 flex items-center justify-center"
            >
              {/* Draw slices */}
              {SEGMENTS.map((seg, idx) => {
                const angle = 360 / SEGMENTS.length;
                const rot = idx * angle;
                return (
                  <div 
                    key={idx}
                    style={{
                      transform: `rotate(${rot}deg)`,
                      clipPath: 'polygon(50% 50%, 0 0, 100% 0)',
                      transformOrigin: '50% 50%'
                    }}
                    className={`absolute inset-0 border border-dark-850/10 ${seg.color} flex justify-center`}
                  >
                    {/* Segment text */}
                    <div 
                      className="absolute top-6 text-xs font-black tracking-wider uppercase text-center"
                      style={{ transformOrigin: 'center' }}
                    >
                      {seg.label}
                    </div>
                  </div>
                );
              })}

              {/* Inner core cap */}
              <div className="absolute h-16 w-16 bg-dark-900 border-4 border-dark-700 rounded-full z-10 flex items-center justify-center shadow-inner">
                <div className="h-4 w-4 bg-cyber-gradient rounded-full shadow-neon-purple-glow" />
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

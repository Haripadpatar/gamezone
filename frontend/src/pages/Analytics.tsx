import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  TrendingUp, 
  Coins, 
  Trophy, 
  Percent, 
  Heart, 
  BarChart3, 
  Wallet, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { myBets } = useGame();

  // Active hover states for custom SVG charts tooltips
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 1. Dynamic Bets Aggregation (Falls back to pre-seeded statistics if empty)
  const hasBets = myBets && myBets.length > 0;

  const totalGamesPlayed = hasBets ? myBets.length : 148;
  const totalBetsVolume = hasBets ? myBets.reduce((acc, b) => acc + b.betAmount, 0) : 2450.00;
  const totalWins = hasBets ? myBets.filter(b => b.payout > 0).length : 84;
  const totalLosses = hasBets ? myBets.filter(b => b.payout === 0).length : 64;
  const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;

  // Find favorite game
  let favoriteGame = 'Aviator';
  if (hasBets) {
    const counts: Record<string, number> = {};
    myBets.forEach(b => {
      counts[b.gameType] = (counts[b.gameType] || 0) + 1;
    });
    let maxCount = 0;
    Object.keys(counts).forEach(g => {
      if (counts[g] > maxCount) {
        maxCount = counts[g];
        favoriteGame = g;
      }
    });
  }

  // 2. SVG Line Chart Metrics (Daily wagers volume)
  const dailyData = [
    { label: 'Mon', val: 120 },
    { label: 'Tue', val: 240 },
    { label: 'Wed', val: 190 },
    { label: 'Thu', val: 480 },
    { label: 'Fri', val: 310 },
    { label: 'Sat', val: 560 },
    { label: 'Sun', val: 420 }
  ];

  // 3. SVG Bar Chart Metrics (Weekly rounds count)
  const weeklyData = [
    { label: 'Wk 1', val: 18 },
    { label: 'Wk 2', val: 32 },
    { label: 'Wk 3', val: 25 },
    { label: 'Wk 4', val: 45 },
    { label: 'Wk 5', val: 28 }
  ];

  // Helper coordinate mapper for SVG line path drawing
  const getLineCoordinatesPath = (): string => {
    let path = '';
    dailyData.forEach((d, idx) => {
      const x = 50 + idx * 60;
      const y = 150 - (d.val / 600) * 100;
      path += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  };

  const getAreaCoordinatesPath = (): string => {
    let path = getLineCoordinatesPath();
    // Connect to bottom right, then bottom left, then close
    const startX = 50;
    const endX = 50 + (dailyData.length - 1) * 60;
    path += ` L ${endX} 150 L ${startX} 150 Z`;
    return path;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="text-neon-cyan" size={24} /> Analytics & Performance
        </h1>
        <p className="text-xs text-gray-400">Monitor your wager statistics, win ratios, and game volume charts.</p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Games */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <span>Games Played</span>
            <TrendingUp size={14} className="text-neon-cyan" />
          </div>
          <div className="text-xl font-black text-white font-mono">{totalGamesPlayed}</div>
          <span className="text-[9px] text-gray-550 block">All-time sessions</span>
        </div>

        {/* Total Bets volume */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-550 font-bold uppercase tracking-wider">
            <span>Total Stakes</span>
            <Coins size={14} className="text-neon-gold" />
          </div>
          <div className="text-xl font-black text-white font-mono">${totalBetsVolume.toFixed(2)}</div>
          <span className="text-[9px] text-gray-550 block">Cumulative turnover</span>
        </div>

        {/* Total Wins count */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-550 font-bold uppercase tracking-wider">
            <span>Rounds Won</span>
            <Trophy size={14} className="text-emerald-500" />
          </div>
          <div className="text-xl font-black text-white font-mono">{totalWins}</div>
          <span className="text-[9px] text-gray-550 block">Successful cashouts</span>
        </div>

        {/* Total Losses count */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-550 font-bold uppercase tracking-wider">
            <span>Rounds Lost</span>
            <AlertCircle size={14} className="text-red-500" />
          </div>
          <div className="text-xl font-black text-white font-mono">{totalLosses}</div>
          <span className="text-[9px] text-gray-550 block">House captures</span>
        </div>

        {/* Win Rate */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-550 font-bold uppercase tracking-wider">
            <span>Win Ratio</span>
            <Percent size={14} className="text-neon-pink" />
          </div>
          <div className="text-xl font-black text-white font-mono">{winRate.toFixed(1)}%</div>
          <span className="text-[9px] text-gray-550 block">Wager efficiency</span>
        </div>

        {/* Favorite Game */}
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-gray-550 font-bold uppercase tracking-wider">
            <span>Fav Title</span>
            <Heart size={14} className="text-neon-pink fill-neon-pink/10" />
          </div>
          <div className="text-sm font-black text-white truncate uppercase tracking-tight pt-1">{favoriteGame}</div>
          <span className="text-[9px] text-gray-550 block">Most played title</span>
        </div>

      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Activity Line Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Calendar size={14} className="text-neon-cyan" /> Daily Turnover Trend
              </h3>
              <p className="text-[10px] text-gray-500">Stakes volume aggregated over previous 7 days</p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan-glow" />
              <span>Volume ($)</span>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full aspect-[2/1] lg:aspect-auto lg:h-64 flex items-center justify-center bg-dark-950/40 rounded-xl border border-dark-800/80 p-2 overflow-visible select-none">
            <svg viewBox="0 0 460 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[30, 70, 110, 150].map((glY) => (
                <line
                  key={glY}
                  x1="45"
                  y1={glY}
                  x2="430"
                  y2={glY}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="35" y="34" className="text-[8px] font-bold fill-gray-550" textAnchor="end">$600</text>
              <text x="35" y="74" className="text-[8px] font-bold fill-gray-550" textAnchor="end">$360</text>
              <text x="35" y="114" className="text-[8px] font-bold fill-gray-550" textAnchor="end">$120</text>
              <text x="35" y="154" className="text-[8px] font-bold fill-gray-550" textAnchor="end">$0</text>

              {/* Area path fill */}
              <path
                d={getAreaCoordinatesPath()}
                fill="url(#area-grad)"
              />

              {/* Line path stroke */}
              <path
                d={getLineCoordinatesPath()}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]"
              />

              {/* X Axis labels & nodes points */}
              {dailyData.map((d, idx) => {
                const x = 50 + idx * 60;
                const y = 150 - (d.val / 600) * 100;
                return (
                  <g key={idx}>
                    {/* Circle Node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={hoveredLineIndex === idx ? 6 : 4}
                      fill={hoveredLineIndex === idx ? '#22d3ee' : '#06b6d4'}
                      stroke="#020617"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredLineIndex(idx)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                    />
                    {/* Label */}
                    <text
                      x={x}
                      y="166"
                      className="text-[8.5px] font-black fill-gray-500"
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Custom overlay interactive tooltip */}
            {hoveredLineIndex !== null && (
              <div className="absolute top-4 right-4 bg-dark-900 border border-neon-cyan/30 py-1.5 px-2.5 rounded-lg text-[9.5px] font-black text-white shadow-lg animate-scale-up">
                <span className="text-neon-cyan">{dailyData[hoveredLineIndex].label}: </span>
                <span>${dailyData[hoveredLineIndex].val} Turnover</span>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Wallet size={14} className="text-neon-pink" /> Weekly Rounds Count
              </h3>
              <p className="text-[10px] text-gray-550">Total rounds completed per week</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-neon-pink shadow-neon-pink-glow" />
              <span>Rounds</span>
            </div>
          </div>

          {/* SVG Bar Canvas */}
          <div className="relative w-full aspect-[2/1] lg:aspect-auto lg:h-64 flex items-center justify-center bg-dark-950/40 rounded-xl border border-dark-800/80 p-2 overflow-visible select-none">
            <svg viewBox="0 0 360 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[30, 70, 110, 150].map((glY) => (
                <line
                  key={glY}
                  x1="45"
                  y1={glY}
                  x2="330"
                  y2={glY}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="35" y="34" className="text-[8px] font-bold fill-gray-555" textAnchor="end">50</text>
              <text x="35" y="74" className="text-[8px] font-bold fill-gray-555" textAnchor="end">30</text>
              <text x="35" y="114" className="text-[8px] font-bold fill-gray-555" textAnchor="end">10</text>
              <text x="35" y="154" className="text-[8px] font-bold fill-gray-555" textAnchor="end">0</text>

              {/* Bars rendering */}
              {weeklyData.map((w, idx) => {
                const x = 52 + idx * 56;
                const barWidth = 24;
                const height = (w.val / 50) * 120;
                const y = 150 - height;
                return (
                  <g key={idx}>
                    {/* Glowing bar column rect */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="4"
                      fill="url(#bar-grad)"
                      className="cursor-pointer hover:opacity-90 transition-all border border-neon-pink/20"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    />
                    
                    {/* X axis labels */}
                    <text
                      x={x + barWidth / 2}
                      y="166"
                      className="text-[8px] font-black fill-gray-500"
                      textAnchor="middle"
                    >
                      {w.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Custom interactive tooltip */}
            {hoveredBarIndex !== null && (
              <div className="absolute top-4 right-4 bg-dark-900 border border-neon-pink/30 py-1.5 px-2.5 rounded-lg text-[9.5px] font-black text-white shadow-lg animate-scale-up">
                <span className="text-neon-pink">{weeklyData[hoveredBarIndex].label}: </span>
                <span>{weeklyData[hoveredBarIndex].val} Rounds Played</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

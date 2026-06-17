import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Crown } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { leaderboard } = useGame();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('daily');

  // Add mock multipliers to the leaderboard data to enrich display
  const rankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'text-neon-gold text-glow-gold';
      case 2: return 'text-slate-350';
      case 3: return 'text-amber-600';
      default: return 'text-gray-450';
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-neon-gold animate-bounce" size={16} />;
    if (rank <= 3) return <Medal className={rank === 2 ? 'text-slate-300' : 'text-amber-600'} size={16} />;
    return <span className="text-xs font-black w-4 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="text-neon-gold" size={24} /> Global Leaderboard
          </h1>
          <p className="text-xs text-gray-400">Honoring the top earners and elite tier players in the ecosystem</p>
        </div>

        {/* Period filter buttons */}
        <div className="flex bg-dark-900 border border-dark-750 p-1 rounded-xl text-xs font-semibold z-10 shrink-0 self-start sm:self-auto">
          {[
            { id: 'daily', label: 'Daily Win' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'alltime', label: 'All-Time' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === tab.id 
                  ? 'bg-dark-800 text-white font-extrabold shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 md:p-6 overflow-hidden">
        
        {/* Top 3 podium highlight grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b border-dark-750/50 pb-6">
          {leaderboard.slice(0, 3).map((player) => (
            <div 
              key={player.username} 
              className={`relative p-4 rounded-xl border flex items-center justify-between gap-4 bg-dark-900/40 ${
                player.rank === 1 ? 'border-neon-gold/30 shadow-neon-gold' :
                player.rank === 2 ? 'border-slate-500/20' : 'border-amber-700/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-dark-950 flex items-center justify-center relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`} 
                    alt="avatar" 
                    className="h-8 w-8 rounded-lg bg-dark-900" 
                  />
                  <span className="absolute -top-2 -left-2 bg-dark-900 border border-dark-700 h-5 w-5 rounded-full flex items-center justify-center">
                    {getMedalIcon(player.rank)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white truncate max-w-[120px]">{player.username}</div>
                  <span className="text-[8px] font-black uppercase text-neon-cyan">
                    VIP {player.vipTier}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-bold">Total Winnings</div>
                <div className={`font-black text-sm ${player.rank === 1 ? 'text-neon-gold' : 'text-white'}`}>
                  ${player.totalWinnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[450px]">
            <thead>
              <tr className="text-gray-550 border-b border-dark-750/70">
                <th className="py-2.5 font-bold w-12 text-center">Rank</th>
                <th className="py-2.5 font-bold">Player Name</th>
                <th className="py-2.5 font-bold text-center">VIP Tier</th>
                <th className="py-2.5 font-bold text-center">Bets Completed</th>
                <th className="py-2.5 font-bold text-right pr-4">Total Payouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/30">
              {leaderboard.map(player => (
                <tr 
                  key={player.username} 
                  className={`hover:bg-dark-900/30 transition-colors ${player.rank <= 3 ? 'bg-dark-900/10' : ''}`}
                >
                  <td className={`py-3 text-center font-extrabold ${rankStyle(player.rank)}`}>
                    <div className="flex items-center justify-center">
                      {getMedalIcon(player.rank)}
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`} 
                        alt="avatar" 
                        className="h-6 w-6 rounded bg-dark-950 border border-dark-700" 
                      />
                      <span>{player.username}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      player.vipTier === 'DIAMOND' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20 shadow-neon-cyan-glow' :
                      player.vipTier === 'PLATINUM' ? 'bg-purple-950 text-purple-450 border border-purple-500/20 shadow-neon-purple-glow' :
                      player.vipTier === 'GOLD' ? 'bg-amber-950 text-gold border border-gold-dark/20 shadow-neon-gold-glow' :
                      player.vipTier === 'SILVER' ? 'bg-slate-800 text-slate-350' : 'bg-orange-950 text-orange-450'
                    }`}>
                      {player.vipTier}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-450 font-bold">
                    {Math.floor(player.totalWinnings / 250) + 12}
                  </td>
                  <td className="py-3 text-right font-black text-neon-emerald pr-4">
                    ${player.totalWinnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

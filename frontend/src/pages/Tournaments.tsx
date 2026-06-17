import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Clock, Medal, Award, Flame } from 'lucide-react';

export const Tournaments: React.FC = () => {
  const { tournaments } = useGame();

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-neon-gold animate-bounce" size={16} />;
    if (rank <= 3) return <Medal className={rank === 2 ? 'text-slate-300' : 'text-amber-600'} size={16} />;
    return <span className="text-xs font-black w-4 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-[10px] font-black text-neon-pink uppercase tracking-wider animate-pulse">
            <Flame size={10} /> Active Arena
          </span>
          <h1 className="text-2xl font-black text-white">Weekly Tournament Arena</h1>
          <p className="text-xs text-gray-400">
            Wager on any gaming slots to accumulate leaderboard scores. Every $1 wagered yields 1 tournament point. The top 10 splits the pool!
          </p>
        </div>
        
        {/* Countdown */}
        <div className="flex items-center gap-3 bg-dark-900 border border-dark-750 p-4 rounded-xl z-10 shrink-0 select-none">
          <Clock size={24} className="text-neon-cyan" />
          <div>
            <span className="text-[8px] text-gray-500 font-bold uppercase block">Time Remaining</span>
            <div className="text-sm font-black text-white">3d 14h 25m</div>
          </div>
        </div>
      </div>

      {/* 2. Prize pool status bar */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Weekly Prize Pool</span>
            <div className="text-xl font-black text-neon-emerald text-glow-emerald mt-0.5">$5,000.00 USD</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Participants</span>
            <div className="text-sm font-extrabold text-white mt-0.5">142 Players</div>
          </div>
        </div>

        <div className="h-3 w-full bg-dark-950 border border-dark-850 rounded-full overflow-hidden p-0.5">
          <div 
            style={{ width: '85%' }}
            className="h-full rounded-full bg-cyber-gradient shadow-neon-purple-glow"
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-550 font-bold">
          <span>Start: $1,000</span>
          <span>Target: $5,000 Guaranteed</span>
        </div>
      </div>

      {/* 3. Tournament Standings list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-dark-700/60 p-4 md:p-6 overflow-hidden">
          <h3 className="text-sm font-black text-white mb-4">Leaderboard Rankings</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[400px]">
              <thead>
                <tr className="text-gray-550 border-b border-dark-750/70">
                  <th className="py-2 font-bold w-12 text-center">Rank</th>
                  <th className="py-2 font-bold">Player Name</th>
                  <th className="py-2 font-bold text-center font-bold">Wager Score</th>
                  <th className="py-2 font-bold text-right pr-4">Expected Prize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/30">
                {tournaments.map(player => (
                  <tr 
                    key={player.username}
                    className={`hover:bg-dark-900/35 transition-colors ${player.rank <= 3 ? 'bg-dark-900/10' : ''}`}
                  >
                    <td className="py-3 text-center font-extrabold">
                      <div className="flex items-center justify-center">
                        {getMedalIcon(player.rank)}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`} 
                          alt="avatar" 
                          className="h-5 w-5 rounded bg-dark-950 border border-dark-700" 
                        />
                        <span>{player.username}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-neon-cyan font-black">
                      {player.points.toLocaleString()} pts
                    </td>
                    <td className="py-3 text-right font-black text-neon-emerald pr-4">
                      ${player.prize.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Ranks rewards list info */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Award size={14} className="text-neon-cyan" /> Prize Divisions
          </h3>

          <div className="space-y-2.5 text-xs text-gray-400">
            {[
              { rank: '1st Place', share: '40% ($2,000)', desc: 'Guaranteed cash payout' },
              { rank: '2nd Place', share: '20% ($1,000)', desc: 'Guaranteed cash payout' },
              { rank: '3rd Place', share: '10% ($500)', desc: 'Guaranteed cash payout' },
              { rank: '4th - 5th', share: '5% ($250 each)', desc: 'Guaranteed cash payout' },
              { rank: '6th - 10th', share: '2% ($100 each)', desc: 'Practice chips bonuses' }
            ].map(div => (
              <div key={div.rank} className="p-3 bg-dark-900/40 border border-dark-800 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{div.rank}</span>
                  <span className="text-neon-emerald">{div.share}</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5">{div.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

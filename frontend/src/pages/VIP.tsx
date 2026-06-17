import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Gift, Award, Check, Calendar, RotateCcw, Flame } from 'lucide-react';

export const VIP: React.FC = () => {
  const { 
    user, 
    claimDailyBonus, 
    claimWeeklyBonus,
    claimMonthlyBonus,
    claimStreakBonus,
    spinRewardsWheel,
    redeemPromoCode 
  } = useGame();

  const [rewardsTab, setRewardsTab] = useState<'daily' | 'weekly' | 'monthly' | 'streak' | 'spin'>('daily');
  const [promoCode, setPromoCode] = useState('');
  
  // Feedback logs
  const [rewardMsg, setRewardMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const vipLevels = [
    { name: 'BRONZE', points: 0, cashback: '0.1%', bonus: '$5.00', perks: ['Weekly Rebates', 'Standard Support'] },
    { name: 'SILVER', points: 1000, cashback: '0.2%', bonus: '$25.00', perks: ['Custom Reload Bonuses', 'Weekly Rebates', 'Standard Support'] },
    { name: 'GOLD', points: 5000, cashback: '0.5%', bonus: '$150.00', perks: ['Exclusive Match Codes', 'Higher Deposit Limits', 'Faster Withdrawal Approval'] },
    { name: 'PLATINUM', points: 20000, cashback: '0.8%', bonus: '$500.00', perks: ['Personal Account Manager', 'Expedited Bank Wires', 'VIP Priority Support'] },
    { name: 'DIAMOND', points: 100000, cashback: '1.2%', bonus: '$2,500.00', perks: ['Custom Payout Channels', 'No Betting Limits', 'Complimentary Holiday Deals'] }
  ];

  const handleClaim = (type: 'daily' | 'weekly' | 'monthly' | 'streak') => {
    setRewardMsg(null);
    let res;
    if (type === 'daily') res = claimDailyBonus();
    else if (type === 'weekly') res = claimWeeklyBonus();
    else if (type === 'monthly') res = claimMonthlyBonus();
    else res = claimStreakBonus();
    
    setRewardMsg(res);
    setTimeout(() => setRewardMsg(null), 5000);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    const res = redeemPromoCode(promoCode);
    setRewardMsg(res);
    setPromoCode('');
    setTimeout(() => setRewardMsg(null), 5000);
  };

  const handleSpinRewards = () => {
    if (spinning) return;
    setSpinning(true);
    setRewardMsg(null);

    // Random spin angle (at least 5 full spins plus offset)
    const targetAngle = 1800 + Math.floor(Math.random() * 360);
    setWheelRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const res = spinRewardsWheel();
      setRewardMsg(res);
      setTimeout(() => setRewardMsg(null), 5000);
    }, 3000);
  };

  const currentPoints = user ? user.vipPoints : 0;
  const currentTier = user ? user.vipTier : 'BRONZE';

  const nextTierIndex = vipLevels.findIndex(lvl => lvl.name === currentTier) + 1;
  const nextTier = nextTierIndex < vipLevels.length ? vipLevels[nextTierIndex] : null;

  const pointsRequired = nextTier ? nextTier.points : 0;
  const progressPercent = nextTier 
    ? Math.min(100, (currentPoints / pointsRequired) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-md">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="text-neon-gold" size={24} /> VIP Lounge & Rewards
          </h1>
          <p className="text-xs text-gray-400">
            Wager on games to accumulate VIP loyalty points. Higher tiers unlock customized cashback rates, weekly cash drops, and private hosts.
          </p>
        </div>
        <div className="h-16 w-16 bg-neon-gold/10 border border-neon-gold/30 rounded-2xl flex items-center justify-center text-neon-gold shrink-0 z-10 animate-bounce">
          <Award size={32} />
        </div>
      </div>

      {/* 2. User VIP Progress Tracking */}
      {user ? (
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Account Club Membership</span>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                VIP Tier Status: <span className="text-neon-gold text-glow-gold">{currentTier}</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Loyalty Points</span>
              <div className="text-base font-black text-white">{currentPoints} pts</div>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress to {nextTier.name}</span>
                <span>{currentPoints} / {pointsRequired} pts</span>
              </div>
              <div className="h-3 w-full bg-dark-950 border border-dark-850 rounded-full overflow-hidden p-0.5">
                <div 
                  style={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full bg-cyber-gradient shadow-neon-purple-glow transition-all duration-1000"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center glass-panel rounded-2xl border border-dark-700/60 text-xs text-gray-500">
          Please log in to view and track your VIP Club progress.
        </div>
      )}

      {/* 3. Daily Rewards Center */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 overflow-hidden flex flex-col md:flex-row min-h-[320px]">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 border-r border-dark-750 bg-dark-900/10 flex flex-col">
          <div className="p-4 border-b border-dark-750">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <Gift size={14} className="text-neon-cyan" /> Rewards Center
            </h3>
            <span className="text-[8px] text-gray-500 font-semibold uppercase">Claim free bonuses</span>
          </div>

          <div className="p-2 space-y-1 flex-1">
            {[
              { id: 'daily', label: 'Daily Bonus', icon: Calendar },
              { id: 'weekly', label: 'Weekly Payout', icon: Award },
              { id: 'monthly', label: 'Monthly Cashback', icon: Crown },
              { id: 'streak', label: 'Streak Rewards', icon: Flame },
              { id: 'spin', label: 'Spin Rewards', icon: RotateCcw }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setRewardsTab(item.id as any); setRewardMsg(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold text-left transition-all ${
                  rewardsTab === item.id 
                    ? 'bg-dark-850 text-white border-l-2 border-neon-cyan' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-900/40'
                }`}
              >
                <item.icon size={14} className={rewardsTab === item.id ? 'text-neon-cyan' : 'text-gray-500'} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content detail panels */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            {rewardMsg && (
              <div className={`p-3 rounded-xl border text-[10px] font-bold text-center animate-scale-up ${
                rewardMsg.success 
                  ? 'bg-emerald-950/40 border-emerald-500/20 text-neon-emerald' 
                  : 'bg-red-950/20 border-red-500/20 text-neon-pink'
              }`}>
                {rewardMsg.message}
              </div>
            )}

            {rewardsTab === 'daily' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white">Daily Check-in Rewards</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                  Log in every 24 hours to claim a free allowance of $15.00 bonus balance coins to wager on any chance games.
                </p>
                <button
                  onClick={() => handleClaim('daily')}
                  className="py-2 px-5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all"
                >
                  Claim Daily $15.00
                </button>
              </div>
            )}

            {rewardsTab === 'weekly' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white">Weekly Loyalty Match</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                  Active VIP members get matched with a $50.00 reload match weekly based on wagering scores.
                </p>
                <button
                  onClick={() => handleClaim('weekly')}
                  className="py-2 px-5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all"
                >
                  Claim Weekly $50.00
                </button>
              </div>
            )}

            {rewardsTab === 'monthly' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white">Monthly Cashback Rebates</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                  Reclaim your gaming returns! Claim your flat $150.00 monthly loyal cash back credit.
                </p>
                <button
                  onClick={() => handleClaim('monthly')}
                  className="py-2 px-5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all"
                >
                  Claim Monthly $150.00
                </button>
              </div>
            )}

            {rewardsTab === 'streak' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white">Login Streak Milestones</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                  Log in 5 days consecutively without breaks to unlock a streak bonus of $30.00.
                </p>
                <button
                  onClick={() => handleClaim('streak')}
                  className="py-2 px-5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all"
                >
                  Verify & Claim Streak
                </button>
              </div>
            )}

            {rewardsTab === 'spin' && (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="space-y-2 max-w-xs text-center md:text-left">
                  <h4 className="text-xs font-black text-white">Daily Rewards Wheel Spin</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Spin our lucky segments wheel daily to earn random multipliers (up to 5x) on $10.00 bonus balance codes.
                  </p>
                  <button
                    onClick={handleSpinRewards}
                    disabled={spinning}
                    className="py-2 px-5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {spinning ? 'Spinning...' : 'Spin Free Wheel'}
                  </button>
                </div>

                {/* Spin wheel visual indicator */}
                <div className="relative h-36 w-36 select-none shrink-0 border-4 border-dark-755 rounded-full flex items-center justify-center bg-dark-900 shadow-xl overflow-hidden">
                  {/* Indicator arrow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-neon-pink" />
                  
                  <div 
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: spinning ? 'transform 3.5s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none'
                    }}
                    className="w-full h-full rounded-full relative bg-dark-950 flex items-center justify-center"
                  >
                    {[0.2, 0.5, 1.0, 2.0, 5.0].map((mult, idx) => {
                      const rot = idx * (360 / 5);
                      return (
                        <div 
                          key={idx}
                          style={{
                            transform: `rotate(${rot}deg)`,
                            clipPath: 'polygon(50% 50%, 0 0, 100% 0)',
                            transformOrigin: '50% 50%'
                          }}
                          className="absolute inset-0 flex justify-center text-[10px] font-black text-gray-400 top-2"
                        >
                          {mult}x
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Promo code redeemer at the bottom */}
          <div className="border-t border-dark-750 pt-4 mt-6">
            <form onSubmit={handlePromoSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div>
                <h5 className="text-[10px] font-bold text-white">Got a Promo Voucher?</h5>
                <p className="text-[8px] text-gray-500">Apply voucher keys to unlock reload matching coins</p>
              </div>
              
              <div className="flex gap-1.5 w-full sm:w-auto sm:ml-auto">
                <input
                  type="text"
                  placeholder="e.g. SPACEH50"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-dark-950 border border-dark-750 rounded-lg py-1 px-3 text-[10px] text-white focus:outline-none w-full sm:w-36"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1 bg-neon-purple hover:bg-neon-purple/85 text-white font-black text-[10px] rounded-lg uppercase transition-all"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* 4. Tier Benefits Matrix */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-4 md:p-6">
        <h3 className="text-sm font-black text-white mb-4">VIP Lounge Reward Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead>
              <tr className="text-gray-550 border-b border-dark-750/70">
                <th className="py-2.5 font-bold">Tier</th>
                <th className="py-2.5 font-bold">Points Req</th>
                <th className="py-2.5 font-bold">Wager Cashback</th>
                <th className="py-2.5 font-bold">Level-up Reward</th>
                <th className="py-2.5 font-bold">Special Perks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/30">
              {vipLevels.map(lvl => (
                <tr 
                  key={lvl.name} 
                  className={`hover:bg-dark-900/35 transition-colors ${currentTier === lvl.name ? 'bg-neon-gold/5 font-semibold' : ''}`}
                >
                  <td className="py-3.5 font-black flex items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      lvl.name === 'DIAMOND' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' :
                      lvl.name === 'PLATINUM' ? 'bg-purple-950 text-purple-450 border border-purple-500/20' :
                      lvl.name === 'GOLD' ? 'bg-amber-950 text-gold border border-gold-dark/20' :
                      lvl.name === 'SILVER' ? 'bg-slate-800 text-slate-350' : 'bg-orange-950 text-orange-450'
                    }`}>
                      {lvl.name}
                    </span>
                    {currentTier === lvl.name && (
                      <span className="text-[9px] font-bold text-neon-gold flex items-center gap-0.5">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-gray-300 font-bold">{lvl.points.toLocaleString()} pts</td>
                  <td className="py-3.5 text-neon-emerald font-black">{lvl.cashback}</td>
                  <td className="py-3.5 text-white font-extrabold">{lvl.bonus}</td>
                  <td className="py-3.5 text-gray-400">
                    <div className="flex flex-wrap gap-1.5">
                      {lvl.perks.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-dark-900 border border-dark-800 text-[9px] rounded-lg text-gray-400 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
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

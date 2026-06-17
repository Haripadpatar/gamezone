import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Share2, Users, Copy, Check, Coins, ChevronRight, ChevronDown } from 'lucide-react';

export const Referral: React.FC = () => {
  const { user, referralBalance, claimReferralEarnings } = useGame();
  const [copied, setCopied] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'CryptoNinja': false,
    'DiceKing': false
  });

  const refCode = user ? user.referralCode : 'SIGNUP123';
  const refLink = `${window.location.origin}/?ref=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    const success = claimReferralEarnings();
    if (success) {
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 4000);
    }
  };

  const toggleNode = (name: string) => {
    setExpandedNodes(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Mock Referral Tree Nodes Data
  const referralTree = [
    {
      name: 'CryptoNinja',
      status: 'Active',
      wagered: 1250,
      tier2: [
        { name: 'GamerX', status: 'Active', wagered: 350 },
        { name: 'ApexPredator', status: 'Idle', wagered: 50 }
      ]
    },
    {
      name: 'DiceKing',
      status: 'Active',
      wagered: 840,
      tier2: [
        { name: 'LuckyStriker', status: 'Active', wagered: 620 }
      ]
    },
    {
      name: 'SpinQueen',
      status: 'Idle',
      wagered: 120,
      tier2: []
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-md">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-neon-cyan" size={24} /> Invite Partners Program
          </h1>
          <p className="text-xs text-gray-400">
            Share your connection code. Earn <span className="text-neon-cyan font-bold">1.5% cashback commissions</span> on all wagers played by your referrals, instantly credited to your payout balance.
          </p>
        </div>
        <div className="h-16 w-16 bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl flex items-center justify-center text-neon-cyan shrink-0 z-10 animate-bounce">
          <Share2 size={32} />
        </div>
      </div>

      {/* 2. Referral Code & Link Terminal */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Your Affiliate Channels</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-550 font-bold uppercase">Personal Invite Link</label>
            <div className="flex bg-dark-950 border border-dark-850 p-2 rounded-xl items-center justify-between">
              <span className="text-xs text-gray-355 truncate pr-4 select-all">{refLink}</span>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                title="Copy Link"
              >
                {copied ? <Check size={14} className="text-neon-cyan" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-550 font-bold uppercase">Referral Code</label>
            <div className="flex bg-dark-950 border border-dark-850 p-2 rounded-xl items-center justify-between">
              <span className="text-xs text-white font-extrabold tracking-widest select-all pl-2">{refCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(refCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                title="Copy Code"
              >
                {copied ? <Check size={14} className="text-neon-cyan" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Earnings Dashboard & Claim Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-dark-700/60 bg-dark-900/30 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Total Referred Accounts</div>
          <div className="text-xl font-black text-white">{user ? 3 : 0}</div>
          <span className="text-[8px] text-gray-550">Registered affiliate users</span>
        </div>

        <div className="p-4 rounded-xl border border-dark-700/60 bg-dark-900/30 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Active Referrals</div>
          <div className="text-xl font-black text-neon-cyan">{user ? 2 : 0}</div>
          <span className="text-[8px] text-gray-550">Active in the last 24h</span>
        </div>

        <div className="p-4 rounded-xl border border-dark-700/60 bg-dark-900/30 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Commissions Earned</div>
          <div className="text-xl font-black text-neon-emerald">${user ? '125.50' : '0.00'}</div>
          <span className="text-[8px] text-gray-550">Lifetime affiliate commissions</span>
        </div>

        <div className="p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 space-y-2 flex flex-col justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-500 font-bold uppercase">Claimable Commission</div>
            <div className="text-lg font-black text-neon-cyan">${referralBalance.toFixed(2)}</div>
          </div>

          {claimSuccess && (
            <div className="text-[9px] text-neon-emerald font-bold flex items-center gap-1 animate-pulse">
              <Check size={10} /> Claimed! Sent to Main Wallet.
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={referralBalance <= 0}
            className={`w-full py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              referralBalance > 0
                ? 'bg-neon-cyan hover:bg-neon-cyan/85 text-black shadow-lg shadow-neon-cyan/15'
                : 'bg-dark-800 text-gray-550 border border-dark-750 cursor-not-allowed'
            }`}
          >
            <Coins size={12} /> Claim to Wallet
          </button>
        </div>
      </div>

      {/* 4. Referral Tree Component */}
      <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-black text-white">Visual Referral Tree Hierarchy</h3>
          <p className="text-[10px] text-gray-400">Expand nodes to inspect secondary (Tier 2) referrals and wagers</p>
        </div>

        {user ? (
          <div className="p-4 bg-dark-900/20 border border-dark-800 rounded-xl space-y-3 font-semibold text-xs">
            
            {/* Root Node: You */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyber-gradient flex items-center justify-center font-black text-white text-[10px]">
                You
              </div>
              <div className="font-bold text-white text-xs">{user.username} (Root)</div>
            </div>

            {/* Tree Branch Lines */}
            <div className="pl-6 border-l border-dark-700 space-y-4 pt-2">
              {referralTree.map(t1 => (
                <div key={t1.name} className="space-y-2 relative">
                  {/* Horizontal connect connector line */}
                  <div className="absolute left-[-24px] top-4 w-4 border-t border-dark-700" />
                  
                  <div className="flex items-center justify-between p-2.5 bg-dark-900 border border-dark-800 rounded-xl max-w-md select-none">
                    <div 
                      onClick={() => t1.tier2.length > 0 && toggleNode(t1.name)}
                      className="flex items-center gap-2 cursor-pointer hover:text-neon-cyan transition-colors"
                    >
                      {t1.tier2.length > 0 ? (
                        expandedNodes[t1.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                      ) : (
                        <span className="w-3.5" />
                      )}
                      
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${t1.name}`} 
                        alt="avatar" 
                        className="h-5 w-5 rounded bg-dark-950" 
                      />
                      <span className="font-bold text-white text-[11px]">{t1.name}</span>
                      <span className="text-[8px] text-gray-550">(Tier 1)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        t1.status === 'Active' ? 'bg-emerald-950 text-neon-emerald' : 'bg-dark-800 text-gray-500'
                      }`}>
                        {t1.status}
                      </span>
                      <span className="text-gray-450 font-bold text-[10px]">${t1.wagered} wagered</span>
                    </div>
                  </div>

                  {/* Tier 2 Referrals tree nesting */}
                  {expandedNodes[t1.name] && t1.tier2.length > 0 && (
                    <div className="pl-8 border-l border-dark-750 space-y-2 pt-1">
                      {t1.tier2.map(t2 => (
                        <div key={t2.name} className="flex items-center justify-between p-2 bg-dark-950/60 border border-dark-800 rounded-xl max-w-sm relative">
                          {/* connect branch line */}
                          <div className="absolute left-[-32px] top-4 w-6 border-t border-dark-750" />
                          
                          <div className="flex items-center gap-2">
                            <img 
                              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${t2.name}`} 
                              alt="avatar" 
                              className="h-4 w-4 rounded bg-dark-900" 
                            />
                            <span className="font-bold text-white text-[10px]">{t2.name}</span>
                            <span className="text-[8px] text-gray-600">(Tier 2)</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-1 rounded text-[7px] font-bold ${
                              t2.status === 'Active' ? 'bg-emerald-950 text-neon-emerald' : 'bg-dark-800 text-gray-500'
                            }`}>
                              {t2.status}
                            </span>
                            <span className="text-gray-500 font-bold text-[9px]">${t2.wagered}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-550 border border-dark-800 rounded-xl">
            Please log in to inspect your affiliate network structures.
          </div>
        )}
      </div>

    </div>
  );
};

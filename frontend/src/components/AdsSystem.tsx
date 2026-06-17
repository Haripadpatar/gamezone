import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { X, Play, Volume2, ShieldCheck, Gift } from 'lucide-react';

interface AdProps {
  placement: 'banner' | 'popup' | 'sidebar' | 'rewarded';
}

export const AdsSystem: React.FC<AdProps> = ({ placement }) => {
  const { activeAds, watchRewardedAd } = useGame();
  const [showPopup, setShowPopup] = useState(false);
  const [rewardedActive, setRewardedActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [adFinished, setAdFinished] = useState(false);

  // Auto show popup on homepage load if enabled
  useEffect(() => {
    if (placement === 'popup' && activeAds.popup) {
      const shown = sessionStorage.getItem('antigravity_popup_shown');
      if (!shown) {
        const timer = setTimeout(() => {
          setShowPopup(true);
          sessionStorage.setItem('antigravity_popup_shown', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [placement, activeAds.popup]);

  // Rewarded Video Countdown logic
  useEffect(() => {
    let interval: any;
    if (rewardedActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (rewardedActive && countdown === 0) {
      setAdFinished(true);
    }
    return () => clearInterval(interval);
  }, [rewardedActive, countdown]);

  if (!activeAds[placement]) return null;

  const handleStartRewardedAd = () => {
    setCountdown(5);
    setAdFinished(false);
    setRewardedActive(true);
  };

  const handleClaimReward = () => {
    watchRewardedAd();
    setRewardedActive(false);
    setAdFinished(false);
  };

  // 1. POPUP AD
  if (placement === 'popup') {
    if (!showPopup) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-sm glass-panel-glow rounded-2xl overflow-hidden p-6 text-center animate-scale-up">
          <button 
            onClick={() => setShowPopup(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="h-12 w-12 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4 text-neon-cyan animate-pulse">
            <Gift size={24} />
          </div>

          <h3 className="text-xl font-black text-white text-glow-cyan mb-2">WELCOME OFFER</h3>
          <p className="text-xs text-gray-400 mb-6">
            Enter promotional code <span className="text-neon-cyan font-bold bg-dark-900 px-2 py-1 rounded border border-dark-700 select-all">ANTIGRAVITY50</span> to claim $50 free credits!
          </p>

          <button
            onClick={() => setShowPopup(false)}
            className="w-full py-2 bg-cyber-gradient text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-neon-purple/20 transition-all"
          >
            Claim Credits Now
          </button>
        </div>
      </div>
    );
  }

  // 2. BANNER AD
  if (placement === 'banner') {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl glass-panel border border-neon-purple/20 p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-dark-900/60 mb-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
            <Gift size={20} className="animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Antigravity Partner Program</h4>
            <p className="text-xs text-gray-450">Invite friends and earn 1% commission cashbacks on all their bets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] font-black uppercase text-neon-purple border border-neon-purple/30 px-1.5 py-0.5 rounded shrink-0">Sponsor</span>
        </div>
      </div>
    );
  }

  // 3. SIDEBAR AD
  if (placement === 'sidebar') {
    return (
      <div className="p-4 rounded-xl border border-dark-700 bg-dark-900/30 text-center space-y-3">
        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Sponsored Widget</div>
        <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg text-xs font-semibold">
          <div className="text-neon-gold text-glow-gold mb-1">VIP Tiers Unlocked</div>
          <div className="text-gray-400">Play games to earn reward levels and commission rebates.</div>
        </div>
      </div>
    );
  }

  // 4. REWARDED AD (Interactive Simulation Overlay)
  if (placement === 'rewarded') {
    return (
      <>
        <div className="p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-center space-y-3 glass-panel">
          <div className="flex items-center justify-center gap-2 text-neon-cyan text-xs font-bold uppercase tracking-wider">
            <Play size={14} /> Rewarded Ad Center
          </div>
          <p className="text-xs text-gray-400">Watch a quick sponsor video to instantly earn $50 practice credits.</p>
          
          <button
            onClick={handleStartRewardedAd}
            className="w-full py-2 bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/40 text-neon-cyan rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Play size={12} fill="currentColor" /> Play Video Ad (+ $50.00)
          </button>
        </div>

        {rewardedActive && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95">
            <div className="relative w-full max-w-lg aspect-video bg-dark-950 border border-dark-700 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              
              {/* Fake Video Screen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-dark-900 to-dark-800 opacity-60 flex items-center justify-center">
                <Volume2 className="absolute top-4 left-4 text-gray-500 animate-pulse" size={20} />
                <div className="text-4xl font-extrabold text-white/5 opacity-10 uppercase tracking-widest select-none select-none">
                  Sponsor Showcase
                </div>
              </div>

              {!adFinished ? (
                <div className="z-10 space-y-3">
                  <div className="animate-spin h-8 w-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto" />
                  <h4 className="text-sm font-semibold text-white">Stream Loading...</h4>
                  <div className="inline-block px-3 py-1 bg-dark-900 text-neon-cyan border border-neon-cyan/30 rounded-full text-xs font-black">
                    Ad finishes in {countdown}s
                  </div>
                </div>
              ) : (
                <div className="z-10 space-y-4 animate-scale-up">
                  <div className="inline-flex p-3 bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald rounded-full mb-1">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-lg font-black text-white">Ad Completed!</h4>
                  <p className="text-xs text-gray-400">Claim your free gaming coins now.</p>
                  
                  <button
                    onClick={handleClaimReward}
                    className="px-6 py-2.5 bg-neon-emerald text-black font-black text-xs rounded-xl shadow-lg shadow-neon-emerald/20 hover:opacity-90 transition-all"
                  >
                    Claim $50.00 Practice Coins
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

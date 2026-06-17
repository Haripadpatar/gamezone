import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ShieldAlert, Coins, Percent, Play, ToggleLeft, ToggleRight, Check, X, 
  ShieldAlert as AlertIcon, Users as UsersIcon, FileSpreadsheet, FileText, BarChart2 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    user,
    transactions, 
    houseRtp, 
    setHouseRtp, 
    activeAds, 
    toggleAdState, 
    adminUpdateTransactionStatus,
    adminUpdateUserBalance,
    adminApproveKyc,
    adminRejectKyc,
    adminAddFAQItem,
    adminAddAnnouncement,
    faqItems,
    blogAnnouncements
  } = useGame();

  const [adminTab, setAdminTab] = useState<'moderation' | 'ads' | 'cms'>('moderation');
  const [inputRtp, setInputRtp] = useState(houseRtp.toString());
  
  // Balance override state
  const [balanceUsername, setBalanceUsername] = useState('CryptoNinja');
  const [balanceAmount, setBalanceAmount] = useState('500');
  const [balanceIsReal, setBalanceIsReal] = useState(true);
  
  // CMS state
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('Account');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const pendingTx = transactions.filter(tx => tx.status === 'PENDING');

  const handleRtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rtpVal = parseFloat(inputRtp);
    if (isNaN(rtpVal) || rtpVal < 50 || rtpVal > 99.9) {
      alert('RTP must be a percentage between 50% and 99.9%');
      return;
    }
    setHouseRtp(rtpVal);
    triggerFeedback('House RTP successfully updated.');
  };

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(balanceAmount);
    if (isNaN(amt) || amt < 0) {
      alert('Amount must be a positive number');
      return;
    }
    adminUpdateUserBalance(balanceUsername, amt, balanceIsReal);
    triggerFeedback(`Balance for "${balanceUsername}" set to $${amt.toFixed(2)} (${balanceIsReal ? 'Real' : 'Practice'}).`);
    setBalanceAmount('');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ || !faqA) return;
    adminAddFAQItem(faqQ, faqA, faqCat);
    setFaqQ('');
    setFaqA('');
    triggerFeedback('New FAQ item published to the Helpdesk Database.');
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    adminAddAnnouncement(annTitle, annContent);
    setAnnTitle('');
    setAnnContent('');
    triggerFeedback('New announcement published to the Lobby feed.');
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-red-950/20 border border-red-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl font-black text-red-400 flex items-center gap-2">
            <ShieldAlert size={24} /> Admin Command Center
          </h1>
          <p className="text-xs text-gray-400">Moderating financial transactions, game engines, payouts and advertising states</p>
        </div>
        <div className="text-right z-10 shrink-0">
          <span className="inline-block px-3 py-1 bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-black rounded-lg uppercase tracking-widest">
            AGX Level-5 Clearance
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-neon-emerald rounded-xl text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-dark-750/70 bg-dark-900/10 text-xs font-bold text-gray-400 select-none">
        <button
          onClick={() => setAdminTab('moderation')}
          className={`py-2 px-5 border-b-2 transition-all ${adminTab === 'moderation' ? 'text-red-400 border-red-500 bg-red-950/5' : 'border-transparent hover:text-white'}`}
        >
          Wagers & KYC Moderation
        </button>
        <button
          onClick={() => setAdminTab('ads')}
          className={`py-2 px-5 border-b-2 transition-all ${adminTab === 'ads' ? 'text-red-400 border-red-500 bg-red-950/5' : 'border-transparent hover:text-white'}`}
        >
          Ads & Conversion Metrics
        </button>
        <button
          onClick={() => setAdminTab('cms')}
          className={`py-2 px-5 border-b-2 transition-all ${adminTab === 'cms' ? 'text-red-400 border-red-500 bg-red-950/5' : 'border-transparent hover:text-white'}`}
        >
          CMS Portal Editor
        </button>
      </div>

      {/* 1. MODERATION TAB */}
      {adminTab === 'moderation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Engine Configuration (RTP / House Edge) */}
            <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-dark-750 pb-3">
                <div className="p-2 bg-neon-gold/10 border border-neon-gold/30 text-neon-gold rounded-xl">
                  <Percent size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">RTP Configuration</h3>
                  <p className="text-[10px] text-gray-405">Adjust the theoretical Return to Player payout matrix</p>
                </div>
              </div>

              <form onSubmit={handleRtpSubmit} className="space-y-4 text-xs">
                <div className="flex justify-between items-center bg-dark-900 border border-dark-750 p-3 rounded-xl">
                  <span className="text-gray-400 font-semibold">Active RTP Ratio</span>
                  <span className="text-neon-gold font-black text-sm">{houseRtp}%</span>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5 font-semibold">New RTP Value (%)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="50"
                      max="99.9"
                      value={inputRtp}
                      onChange={(e) => setInputRtp(e.target.value)}
                      className="flex-1 bg-dark-900 border border-dark-750 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-neon-gold"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neon-gold hover:bg-neon-gold/85 text-black font-black rounded-xl transition-all uppercase tracking-wider"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* User Balance Overrides */}
            <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-dark-750 pb-3">
                <div className="p-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Manual Balance Regulator</h3>
                  <p className="text-[10px] text-gray-405">Override account balances for testing or settlements</p>
                </div>
              </div>

              <form onSubmit={handleBalanceSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Target User</label>
                    <input
                      type="text"
                      value={balanceUsername}
                      onChange={(e) => setBalanceUsername(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-neon-cyan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">New Balance ($)</label>
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-neon-cyan"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex bg-dark-900 border border-dark-750 p-0.5 rounded-lg font-semibold">
                    <button
                      type="button"
                      onClick={() => setBalanceIsReal(true)}
                      className={`px-2 py-1 rounded text-[10px] ${balanceIsReal ? 'bg-neon-cyan text-black font-black' : 'text-gray-400'}`}
                    >
                      Real Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceIsReal(false)}
                      className={`px-2 py-1 rounded text-[10px] ${!balanceIsReal ? 'bg-dark-700 text-neon-cyan' : 'text-gray-400'}`}
                    >
                      Practice Wallet
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black rounded-xl transition-all uppercase tracking-wider text-[10px]"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* User KYC Verification Queue */}
          {user && user.kycStatus === 'PENDING' && (
            <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-dark-750 pb-3">
                <div className="p-2 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pending KYC Verification Files</h3>
                  <p className="text-[10px] text-gray-400">Validate player documentation to verify account VIP rebates eligibility</p>
                </div>
              </div>

              <div className="p-3 bg-dark-900/60 border border-dark-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{user.username}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Documents: Passport/National ID Card (Pending status)</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { adminApproveKyc(user.username); triggerFeedback('User KYC successfully approved.'); }}
                    className="py-1 px-3 bg-emerald-950 text-neon-emerald border border-emerald-500/20 rounded-lg text-[10px] font-bold hover:bg-emerald-900"
                  >
                    Approve KYC
                  </button>
                  <button
                    onClick={() => { adminRejectKyc(user.username); triggerFeedback('User KYC rejected.'); }}
                    className="py-1 px-3 bg-red-955/20 text-neon-pink border border-red-500/20 rounded-lg text-[10px] font-bold hover:bg-red-900"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Approval Queue */}
          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-750 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertIcon className="text-red-400" size={18} /> Financial Approvals Escrow Queue ({pendingTx.length})
              </h3>
            </div>

            {pendingTx.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs font-semibold">
                All user transaction queues cleared. No pending requests.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-gray-550 border-b border-dark-750">
                      <th className="py-2 font-bold">Tx Reference</th>
                      <th className="py-2 font-bold">Type</th>
                      <th className="py-2 font-bold text-right">Amount ($)</th>
                      <th className="py-2 font-bold text-center">Channel</th>
                      <th className="py-2 font-bold">Timestamp</th>
                      <th className="py-2 font-bold text-right pr-2">Moderate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-750/30">
                    {pendingTx.map(tx => (
                      <tr key={tx.id} className="hover:bg-dark-900/30 transition-colors">
                        <td className="py-3 font-semibold text-white select-all">{tx.reference}</td>
                        <td className="py-3 font-extrabold">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                            tx.type === 'DEPOSIT' ? 'bg-cyan-950 text-neon-cyan border border-cyan-500/20' : 'bg-pink-950 text-neon-pink border border-pink-500/20'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-white pr-4">${tx.amount.toFixed(2)}</td>
                        <td className="py-3 text-center text-gray-405 font-medium">{tx.paymentMethod}</td>
                        <td className="py-3 text-gray-500 text-[10px]">{tx.date}</td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => adminUpdateTransactionStatus(tx.id, 'SUCCESS')}
                              className="p-1 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-450 hover:text-white rounded-lg transition-all"
                              title="Approve Transaction"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => adminUpdateTransactionStatus(tx.id, 'FAILED')}
                              className="p-1 bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-455 hover:text-white rounded-lg transition-all"
                              title="Reject Transaction"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ADS TAB WITH ANALYTICS CHART */}
      {adminTab === 'ads' && (
        <div className="space-y-6">
          {/* Ad Status togglers */}
          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play size={18} className="text-red-400" /> Global Ad Placement Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { id: 'popup', label: 'Welcome Popup Ad', desc: 'Displays promotional codes on load.' },
                { id: 'banner', label: 'Lobby Banner Ad', desc: 'Sponsor boxes displayed inside lobbies.' },
                { id: 'sidebar', label: 'Info Sidebar Ad', desc: 'Affiliate perks displayed on menus.' },
                { id: 'rewarded', label: 'Rewarded Video Hub', desc: 'Grants practice coins on completion.' }
              ].map(ad => (
                <div key={ad.id} className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white truncate pr-2">{ad.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleAdState(ad.id as any, !activeAds[ad.id as keyof typeof activeAds])}
                      className="text-gray-400 hover:text-white"
                    >
                      {activeAds[ad.id as keyof typeof activeAds] ? (
                        <ToggleRight className="text-red-400" size={28} />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">{ad.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Marketing Conversion Metrics Graph */}
          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <BarChart2 size={16} className="text-red-400" /> Campaign Performance Analytics
            </h3>
            
            <div className="p-4 bg-dark-950/60 border border-dark-850 rounded-xl space-y-4">
              <div className="flex justify-between text-xs text-gray-500 font-bold">
                <span>Popup Campaigns (85% CTR)</span>
                <span>Video Rewards (420 daily views)</span>
                <span>Banner Ads (1.2k views)</span>
              </div>
              
              {/* Graphic stats */}
              <div className="h-32 w-full flex items-end gap-2.5 pt-6 select-none border-b border-dark-800">
                {[
                  { label: 'Popup CTR', height: 'h-24', color: 'bg-red-500' },
                  { label: 'Video Claims', height: 'h-28', color: 'bg-neon-cyan shadow-neon-cyan-glow' },
                  { label: 'Sidebar Clicks', height: 'h-12', color: 'bg-neon-purple shadow-neon-purple-glow' },
                  { label: 'Direct Referrals', height: 'h-16', color: 'bg-neon-gold shadow-neon-gold-glow' }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className={`${bar.height} w-8 rounded-t-lg ${bar.color} transition-all duration-1000`} />
                    <span className="text-[8px] text-gray-500 font-extrabold">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CMS PORTAL TAB */}
      {adminTab === 'cms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ addition */}
          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-dark-750 pb-3">
              <div className="p-2 bg-red-950/20 border border-red-500/20 text-red-450 rounded-xl">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">FAQ Database Editor</h3>
                <p className="text-[10px] text-gray-400">Add FAQ items immediately indexed on Helpdesk lists</p>
              </div>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-gray-550 mb-1">Question Description</label>
                  <input
                    type="text"
                    value={faqQ}
                    onChange={(e) => setFaqQ(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-550 mb-1">Category</label>
                  <select
                    value={faqCat}
                    onChange={(e) => setFaqCat(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none font-bold"
                  >
                    <option value="Account">Account</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Games">Games</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-550 mb-1">Answer Details</label>
                <textarea
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-red-500 h-16 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors text-[10px] uppercase tracking-wider"
              >
                Publish FAQ Entry
              </button>
            </form>

            <div className="border-t border-dark-750 pt-3 space-y-2">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">FAQ Index Counts ({faqItems.length})</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[10px] text-gray-400">
                {faqItems.map(f => (
                  <div key={f.id} className="p-1.5 bg-dark-900/40 rounded border border-dark-800 leading-normal truncate">
                    Q: {f.question}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Announcements addition */}
          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-dark-750 pb-3">
              <div className="p-2 bg-red-950/20 border border-red-500/20 text-red-405 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Lobby Announcements Blog</h3>
                <p className="text-[10px] text-gray-400">Publish news feeds visible on home lobby page panels</p>
              </div>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-550 mb-1">Title Summary</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-550 mb-1">Announcement Content</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-red-500 h-16 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors text-[10px] uppercase tracking-wider"
              >
                Publish Announcement
              </button>
            </form>

            <div className="border-t border-dark-750 pt-3 space-y-2">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Active Blog Index ({blogAnnouncements.length})</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[10px] text-gray-400">
                {blogAnnouncements.map(ann => (
                  <div key={ann.id} className="p-1.5 bg-dark-900/40 rounded border border-dark-800 leading-normal truncate">
                    Title: {ann.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
